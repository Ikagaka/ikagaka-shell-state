import $ = require("jquery");
import * as NarLoader from "narloader";
import * as ShellLoader from "ikagaka-shell-loader/lib/";
import * as ShellState from "../";
import * as Renderer from "../Renderer/";
import { NanikaContainerSyncDirectory } from "nanika-storage";
function cvt(a: NanikaContainerSyncDirectory): {[a:string]: ()=> Promise<ArrayBuffer>} {
  return a.childrenAllSync().reduce((o,file)=> (o[a.relative(file.path).path] = ()=> Promise.resolve(file.readFileSync().buffer), o), {});
}
window["$"] = $;

$(main);

async function main(){
  $("#version")
    .append("(ShellLoader@"+ShellLoader.version+")")
    .append("(ShellState@"+ShellState.version+")");
  NarLoader.loadFromURI("../nar/mobilemaster.nar").then(changeNar);
  $("#nar").change(function(ev){
    NarLoader.loadFromBuffer($(this).prop("files")[0]).then(changeNar);
  });
}

function changeNar(nanikaDir: NanikaContainerSyncDirectory){
  console.log(nanikaDir.childrenAllSync().map(c => c.path));

  const shelllist = (nanikaDir.new("shell") as NanikaContainerSyncDirectory).childrenSync().map(c => c.basename().path);
  const $frag = $(document.createDocumentFragment());
  shelllist.forEach((shellId)=>{
    $("<option />").val(shellId).text(shellId).appendTo($frag);
  });
  $("#shellId").children().remove().end().append($frag).unbind().change(()=>{ changeShell(nanikaDir); });
  if(shelllist.length === 0){ return console.warn("this nar does not have any shell"); }
  if(shelllist.indexOf("master") !== -1) {
    $("#shellId").val("master").change();
  }else{
    $("#shellId").val(shelllist[0]).change();
  }
}

async function changeShell(nanikaDir: NanikaContainerSyncDirectory){
  const shellDir = cvt(nanikaDir.new("shell/"+$("#shellId").val()) as NanikaContainerSyncDirectory);
  const shell = await ShellLoader.load(shellDir);
  const baseCache = new Renderer.SurfaceBaseRenderer(shell);
  const shellState = new ShellState.ShellState(shell);

  (()=>{
    $("#surfaceId").children().remove();
    const $frag = $(document.createDocumentFragment());
    Object.keys(shell.surfaceDefTree.surfaces).forEach((surfaceId)=>{
      $frag.append($("<option />").val(surfaceId).text(surfaceId));
    });
    $("#surfaceId").append($frag);
  })();

  (()=>{
    $("#bindgroupId").children().remove();
    const $frag = $(document.createDocumentFragment());
    Object.keys(shell.config.bindgroup).forEach((charId)=>{
      const $li = $("<li />").appendTo($frag);
      Object.keys(shell.config.bindgroup[charId]).forEach((bindgroupId)=>{
        const $checkbox = $("<input type='checkbox' name='bindgroupId'/>")
          .val(bindgroupId)
          .prop("checked", shell.config.bindgroup[charId][bindgroupId]);
        $("<label />").text(bindgroupId+":").append($checkbox).appendTo($li);
      });
    });
    $("#bindgroupId").append($frag);
  })();

  (()=>{
    $("#scopeId").unbind().change(()=>{ changeSurface(baseCache, shellState); });
    $("#surfaceId").unbind().change(()=>{
      $("#animationId").children().remove();
      const $frag = $(document.createDocumentFragment());
      const surfaceId = $("#surfaceId").val();
      $("<option />").val("").text("---").appendTo($frag);
      !!shell.surfaceDefTree.surfaces[surfaceId] && shell.surfaceDefTree.surfaces[surfaceId].animations.forEach((animation, i)=>{
        $("<option />").val(i).text(i+":"+animation.intervals.toString()).appendTo($frag);
      });
      $("#animationId").append($frag);
      changeSurface(baseCache, shellState);
    }).val(0).change();
    $("#bindgroupId input[name='bindgroupId']").unbind().change(function(){
      const scopeId = $("#scopeId").val();
      const bindgroupIds = {};
      $(this).each(function(){
        const bindgroupId = $(this).val();
        if($(this).prop("checked")) shellState.bind(Number(scopeId), Number(bindgroupId));
        else                        shellState.unbind(Number(scopeId), Number(bindgroupId));
      });
      shellState.emit("render"); // hack
    });
    $("#collisionDraw").unbind().change(function(){
      if($(this).prop("checked")) shellState.showRegion();
      else                        shellState.hideRegion();
    });
  })();
}

let changeSurface = async function(baseCache: Renderer.SurfaceBaseRenderer, shellState: ShellState.ShellState){
  const div = $("#surface")[0];
  const scopeId = Number($("#scopeId").val());
  const surfaceId = Number($("#surfaceId").val());

  console.log("scopeId:", scopeId, "surfaceId:", surfaceId);

  const {width, height} = await baseCache.getBaseSurfaceSize(surfaceId);
  const rndr = new Renderer.SurfacePatternRenderer(baseCache);
  const cnv = Renderer.Util.createCanvas(width, height);
  rndr.attachCanvas(new Renderer.Canvas(cnv));
  $("#cnv_placeholder").empty().append(cnv);

  const srfState = shellState.createSurfaceState(scopeId, surfaceId, (_, surfaceId, tree)=> rndr.render(surfaceId, tree).then(()=>{}) );
  srfState.debug = true;
  srfState.render();

  $("#animationId").unbind().change(function(){
    const animationId = $(this).val();
    if(isFinite(Number(animationId))){
      srfState.stop(Number(animationId));
      srfState.play(Number(animationId));
    }
  });
  const tmp = changeSurface;
  changeSurface = (a, b)=>{
    srfState.destructor();
    return tmp(a, b);
  }
}

function toHTML(obj){
  if(false){
  }else if(obj instanceof HTMLCanvasElement){
    return Renderer.Util.copy(obj);
  }else if(typeof obj === "number"){ return JSON.stringify(obj);
  }else if(typeof obj === "string"){ return JSON.stringify(obj);
  }else if(typeof obj === "boolean"){ return JSON.stringify(obj);
  }else if(obj === null){ return JSON.stringify(obj);
  }else if(obj === undefined){ return JSON.stringify(obj);
  }else if(obj instanceof Array || obj instanceof Object){
    if(obj instanceof Array && obj.length === 0) return "[]";
    if(obj instanceof Object && Object.keys(obj).length === 0) return "{}";
    var $ul = $("<ul />");
    Object.keys(obj).forEach(function(key){
      $("<li />").text(key+": ").append(toHTML(obj[key])).appendTo($ul)
    });
    return $ul[0];
  }else{
    console.error(obj);
  }
}
