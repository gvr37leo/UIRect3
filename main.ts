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



var canvasize = new Vector(window.innerWidth-10,window.innerHeight-10)
var canvasrect = new Rect(zero.c(),canvasize)
var demoRect = new Box(canvasrect.copy())
var crret = createCanvas(canvasize.x,canvasize.y)
var canvas = crret.canvas
var ctxt = crret.ctxt
var handles = []
var clickmanager = new ClickManager()
clickmanager.listenToDocument()
// var handles = attachHandles2Rect(demoRect,clickmanager)

var flexboxes:FlexBox[] = []

var containerRect = new UIRect(
    new Vector(0,0),new Vector(1,1),
    new Vector(50,50), new Vector(-50,-50),
    demoRect
)

handles = handles.concat(containerRect.attachHandles2UIRect(clickmanager))
var smallrect = new Rect(new Vector(10,10), new Vector(200,200))

var uirects = [
    new UIRect(
        new Vector(0,0),new Vector(0,0),
        smallrect.min.c(),smallrect.max.c(),
        containerRect.absRect.box
    ),
    new UIRect(
        new Vector(1,0),new Vector(1,0),
        smallrect.min.c().add(new Vector(-210,0)),smallrect.max.c().add(new Vector(-210,0)),
        containerRect.absRect.box
    ),
    new UIRect(
        new Vector(1,1),new Vector(1,1),
        smallrect.min.c().add(new Vector(-210,-210)),smallrect.max.c().add(new Vector(-210,-210)),
        containerRect.absRect.box
    ),
    new UIRect(
        new Vector(0,1),new Vector(0,1),
        smallrect.min.c().add(new Vector(0,-210)),smallrect.max.c().add(new Vector(0,-210)),
        containerRect.absRect.box
    ),
    new UIRect(
        new Vector(0,0.5),new Vector(1,0.5),
        new Vector(10,-100),new Vector(-10,100),
        containerRect.absRect.box
    ),
    new UIRect(
        new Vector(0.5,0),new Vector(0.5,0),
        smallrect.min.c().add(new Vector(-220,0)),smallrect.max.c(),
        containerRect.absRect.box
    ),
]

uirects.forEach((uirect,i) => {
    for(var j = 0; j < 4; j++){
        var child = uirect.addChild(
            new Vector(0,0),new Vector(0,0),
            new Vector(-10,-10), new Vector(10,10),
        )
        if(i == 4){
            handles = handles.concat(child.attachHandles2UIRect(clickmanager))
        }
    }
    
    handles = handles.concat(uirect.attachHandles2UIRect(clickmanager))
    flexboxes.push(new FlexBox(uirect,i))
})

// for(var i = 0; i < 6; i++){
//     var offset = new Vector(i * 220, 0)
//     var uirect = new UIRect(
//         new Vector(0,0),new Vector(0,0),
//         new Vector(10,10).add(offset), new Vector(200,200).add(offset),
//         containerRect.absRect.box
//     )
//     handles = handles.concat(uirect.attachHandles2UIRect(clickmanager))

//     for(var j = 0; j < 4; j++){
//         uirect.addChild(
//             new Vector(0,0),new Vector(0,0),
//             new Vector(-10,-10), new Vector(10,10),
//         )
//     }

//     var flexbox = new FlexBox(uirect,i)
//     flexboxes.push(flexbox)
// }




// function attachHandles2Rect(prect:Box<Rect>,clickmanager:ClickManager){
//     var rect = prect.get()
//     var minhandle = new Handle(rect.min,clickmanager)
//     var maxhandle = new Handle(rect.max,clickmanager)
//     minhandle.pos.onchange.listen(e => {
//         rect.min = e.val
//         prect.onchange.trigger(rect,null)
//     })
//     maxhandle.pos.onchange.listen(e => {
//         rect.max = e.val
//         prect.onchange.trigger(rect,null)
//     })

//     return [minhandle,maxhandle]
// }



loop(dodraw)

function dodraw(dt){
    ctxt.clearRect(0,0,canvasize.x,canvasize.y)
    handles.forEach(h => h.draw(ctxt))
    // demoRect.get().draw(ctxt)
    flexboxes.forEach(fb => fb.draw(ctxt))
}