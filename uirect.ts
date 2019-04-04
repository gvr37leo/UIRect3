class UIRect{

    parent:Box<Rect>
    absRect:PBox<Rect>
    anchormax:PBox<Vector>
    anchormin:PBox<Vector>
    offsetmax:PBox<Vector>
    offsetmin:PBox<Vector>
    children:UIRect[] = []
    shouldupdateAbsRect = true

    constructor(anchormin:Vector,anchormax:Vector,offsetmin:Vector,offsetmax:Vector,parent:Box<Rect>){
        this.parent = parent
        this.anchormin = new PBox(anchormin)
        this.anchormax = new PBox(anchormax)
        this.offsetmin = new PBox(offsetmin)
        this.offsetmax = new PBox(offsetmax)
        this.absRect = new PBox(this.calcAbsRect())

        this.parent.onchange.listen((val,old) => {
            this.updateAbsRect(false)
        })
    }

    addChild(uirect:UIRect){
        this.children.push(uirect)
        uirect.parent.value = this.absRect.get()
    }

    updateAbsRect(handled:boolean){
        if(!handled){
            var absrect = this.calcAbsRect()
            this.absRect.setHP(handled,absrect)
        }
    }

    attachHandles2UIRect(clickmanager:ClickManager):Handle[]{
        var absrect = this.absRect.get()
        var handleoffsetmin = new Handle(absrect.min,clickmanager)
        var handleoffsetmax = new Handle(absrect.max,clickmanager)
        var handleanchormin = new Handle(this.calcAbsAnchorPos(this.anchormin.get()),clickmanager)
        var handleanchormax = new Handle(this.calcAbsAnchorPos(this.anchormax.get()),clickmanager)
        var offsethandles = [handleoffsetmin,handleoffsetmax]
        var anchorhandles = [handleanchormin,handleanchormax]
        var offsetDatas = [this.offsetmin,this.offsetmax]
        var anchorDatas = [this.anchormin,this.anchormax]


        //update functions----------------------------------------------
        var updateAbsRect = this.updateAbsRect.bind(this)

        var updateAnchorHandle = (handled:boolean,minormax:number) => {
            var anchor = anchorDatas[minormax]
            var anchorhandle = anchorhandles[minormax]
            anchorhandle.pos.setHP(handled,this.calcAbsAnchorPos(anchor.get()))
        }

        var updateOffsetHandle = (handled:boolean,minormax:number) => {
            var absrectvals = [this.absRect.get().min,this.absRect.get().max]
            offsethandles[minormax].pos.setHP(handled,absrectvals[minormax].c())
        }

        var updateAnchorData = (handled:boolean,minormax:number) => {
            var anchor = anchorDatas[minormax]
            var anchorhandle = anchorhandles[minormax]
            var pos = this.uirectInvlerp(this.parent.get().min, this.parent.get().max,anchorhandle.pos.get())
            anchor.setHP(handled,pos)
        }

        var updateOffsetData = (handled:boolean,minormax:number) => {
            var offset = offsetDatas[minormax]
            var offsethandle = offsethandles[minormax]
            var anchor = anchorDatas[minormax]
            offset.setHP(handled,this.calcAbsAnchorPos(anchor.get()).to(offsethandle.pos.get()))
        }


        //parent-------------------------------
        this.parent.onchange.listen((val,old) => {
            updateAnchorHandle(false,0)
            updateAnchorHandle(false,1)
            updateAbsRect(false)
            updateOffsetHandle(false,0)
            updateOffsetHandle(false,1)
        })

        //absrect-------------------------------
        this.absRect.onchange.listen((e,old) => {
            updateOffsetHandle(e.handled,0)
            updateOffsetHandle(e.handled,1)
        })

        //innerdata change handling---------------
        var processAnchorDataChange = (handled:boolean, minormax:number) => {
            updateAnchorHandle(handled,minormax)
            updateAbsRect(handled)
        }

        var processOffsetDataChange = (handled:boolean, minormax:number) => {
            updateOffsetHandle(handled,minormax)
            updateAbsRect(handled)
        }

        this.anchormin.onchange.listen(e => {
            processAnchorDataChange(e.handled,0)
        })

        this.anchormax.onchange.listen(e => {
            processAnchorDataChange(e.handled,1)
        })
        
        this.offsetmin.onchange.listen(e => {
            processOffsetDataChange(e.handled,0)
        })

        this.offsetmax.onchange.listen(e => {
            processOffsetDataChange(e.handled,1)
        })


        //anchors change handling
        var processAnchorHandleChange = (anchorhandle:PEvent<Vector>, minormax:number) => {
            updateAnchorData(anchorhandle.handled,minormax)
            updateAbsRect(anchorhandle.handled)
            updateOffsetHandle(anchorhandle.handled,minormax)
        }

        var processOffsetHandleChange = (offsetHandle:PEvent<Vector>, minormax:number) => {
            updateOffsetData(offsetHandle.handled,minormax)
            updateAbsRect(offsetHandle.handled)
        }

        handleanchormin.pos.onchange.listen(e => {
            processAnchorHandleChange(e,0)
        })

        handleanchormax.pos.onchange.listen(e => {
            processAnchorHandleChange(e,1)
        })

        handleoffsetmin.pos.onchange.listen(e => {
            processOffsetHandleChange(e,0)
        })

        handleoffsetmax.pos.onchange.listen(e => {
            processOffsetHandleChange(e,1)
        })

        return [handleanchormin,handleanchormax,handleoffsetmin,handleoffsetmax]
    }

    draw(ctxt:CanvasRenderingContext2D){
        var absrect = this.absRect.get() //this.calcAbsRect(this.parent.get())
        var size = absrect.size()
        ctxt.strokeRect(absrect.min.x + 0.5,absrect.min.y + 0.5,size.x,size.y)
        this.children.forEach(c => c.draw(ctxt))
    }

    calcAbsAnchorPos(anchor:Vector){
        return this.uirectlerp(this.parent.get().min,this.parent.get().max,anchor)
    }

    calcAbsRect(){
        var absmin = this.calcAbsAnchorPos(this.anchormin.get()).add(this.offsetmin.get())
        var absmax = this.calcAbsAnchorPos(this.anchormax.get()).add(this.offsetmax.get())
        return new Rect(absmin,absmax)
    }

    uirectlerp(a:Vector,b:Vector,w:Vector){
        return new Vector(lerp(a.x,b.x,w.x),lerp(a.y,b.y,w.y))
    }

    uirectInvlerp(a:Vector,b:Vector,w:Vector){
        return new Vector(inverselerp(a.x,b.x,w.x),inverselerp(a.y,b.y,w.y))
    }

}