/// <reference path="utils.ts" />
/// <reference path="node_modules/vectorx/vector.ts" />
/// <reference path="rect.ts" />
/// <reference path="EventSystem.ts" />
/// <reference path="handle.ts" />
/// <reference path="clickmanager.ts" />
/// <reference path="uirect.ts" />
/// <reference path="flexbox.ts" />



var zero = new Vector(0,0)
var one = new Vector(1,1)

var canvasize = new Vector(500,500)
var canvasrect = new Rect(zero.c(),canvasize)
var demoRect = new Box(new Rect(new Vector(10,10), new Vector(490,490)))
var crret = createCanvas(canvasize.x,canvasize.y)
var canvas = crret.canvas
var ctxt = crret.ctxt

var uirect = new UIRect(
    new Vector(0.1,0.1),new Vector(0.9,0.9),
    new Vector(10,10), new Vector(-10,-10),
    demoRect
)

uirect.addChild(
    new Vector(0,0),new Vector(0,0),
    new Vector(-10,-10), new Vector(10,10),
)
uirect.addChild(
    new Vector(0,0),new Vector(0,0),
    new Vector(-10,-10), new Vector(10,10),
)

var flexbox = new FlexBox(uirect)

var clickmanager = new ClickManager()
clickmanager.listenToDocument()
var handles = uirect.attachHandles2UIRect(clickmanager)
handles = handles.concat(attachHandles2Rect(demoRect,clickmanager))

function attachHandles2Rect(prect:Box<Rect>,clickmanager:ClickManager){
    var rect = prect.get()
    var minhandle = new Handle(rect.min,clickmanager)
    var maxhandle = new Handle(rect.max,clickmanager)
    minhandle.pos.onchange.listen(e => {
        rect.min = e.val
        prect.onchange.trigger(rect,null)
    })
    maxhandle.pos.onchange.listen(e => {
        rect.max = e.val
        prect.onchange.trigger(rect,null)
    })

    return [minhandle,maxhandle]
}



loop(dodraw)

function dodraw(dt){
    ctxt.clearRect(0,0,canvasize.x,canvasize.y)
    uirect.draw(ctxt)
    handles.forEach(h => h.draw(ctxt))
    demoRect.get().draw(ctxt)
}