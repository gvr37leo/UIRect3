class UIRect{

    parent:Box<Rect>
    absRect:PBox<Rect>
    anchormax:PBox<Vector>
    anchormin:PBox<Vector>
    offsetmax:PBox<Vector>
    offsetmin:PBox<Vector>
    children:UIRect[] = []
    shouldupdateAbsRect = true
    anchorchangeenabled: boolean = true;
    offsetchangeenabled: boolean = true;

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

    addChild(anchmin:Vector,anchmax:Vector,offmin:Vector,offmax:Vector){
        var child = new UIRect(anchmin,anchmax,offmin,offmax,this.absRect.box)
        this.children.push(child)
        return child
    }

    updateAbsRect(handled:boolean){
        if(!handled){
            var absrect = this.calcAbsRect()
            this.absRect.setHP(handled,absrect)
        }
    }

    attachHandles2UIRect(clickmanager:ClickManager):Handle[]{

        enum Loc{NW,NE,SE,SW}
        var that = this
        var absrect = this.absRect.get()
        var handleoffsetmin = new Handle(absrect.min,clickmanager,HandleType.offset)
        var handleoffsetmax = new Handle(absrect.max,clickmanager,HandleType.offset)
        var handleoffsetbotleft = new Handle(absrect.getPoint(new Vector(0,1)),clickmanager,HandleType.offset)
        var handleoffsettopright = new Handle(absrect.getPoint(new Vector(1,0)),clickmanager,HandleType.offset)
        var handleanchormin = new Handle(this.calcAbsAnchorPos(this.anchormin.get()),clickmanager,HandleType.anchor)
        var handleanchormax = new Handle(this.calcAbsAnchorPos(this.anchormax.get()),clickmanager,HandleType.anchor)
        var handleanchorbotleft = new Handle(this.calcAbsAnchorPos(new Vector(this.anchormin.get().x,this.anchormax.get().y)),clickmanager,HandleType.anchor)
        var handleanchortopright = new Handle(this.calcAbsAnchorPos(new Vector(this.anchormax.get().x,this.anchormin.get().y)),clickmanager,HandleType.anchor)
        var draghandle = new Handle(absrect.getPoint(new Vector(0.5,0)),clickmanager,HandleType.offset)
        
        var anchorhandles = [
            handleanchormin,
            handleanchortopright,
            handleanchormax,
            handleanchorbotleft,
        ]
        var offsethandles = [
            handleoffsetmin,
            handleoffsettopright,
            handleoffsetmax,
            handleoffsetbotleft,
        ]
        var handles = anchorhandles.concat(offsethandles).concat(draghandle)

        // var dirs = [
        //     [Loc.NW0,Loc.NE1],
        //     [Loc.SW3,Loc.SE2]
        // ]
        var dirmap = [
            [Loc.NE,Loc.SW],
            [Loc.SE,Loc.NW],
            [Loc.SW,Loc.NE],
            [Loc.NW,Loc.SE],
        ]

        var updateAnchorHandles = (handled:boolean) => {
            anchorhandles.forEach((ah, i) => updateAnchorHandle(handled,i))
        }

        var updateOffsetHandles = (handled:boolean) => {
            offsethandles.forEach((ah, i) => updateOffsetHandle(handled,i))
        }

        var updateDragHandle = (handled:boolean) => {
            draghandle.pos.setHP(handled,this.absRect.box.value.getPoint(new Vector(0.5,0)))
        }

        var updateAnchorHandle = (handled:boolean,loc:Loc) => {
            var pos = new Vector()
            if(loc == Loc.NW || loc == Loc.NE){
                pos.y = this.anchormin.get().y
            }else{
                pos.y = this.anchormax.get().y
            }
            if(loc == Loc.NW || loc == Loc.SW){
                pos.x = this.anchormin.get().x
            }else{
                pos.x = this.anchormax.get().x
            }

            var absAnchorHandlePos = this.calcAbsAnchorPos(pos)
            anchorhandles[loc].pos.setHP(handled, absAnchorHandlePos)
        }

        var updateOffsetHandle = (handled:boolean,loc:Loc) => {
            var absOffsetHandlePos = new Vector()
            var minAbsOffsetPos = this.calcAbsOffsetPos(this.anchormin.get(),this.offsetmin.get())
            var maxAbsOffsetPos = this.calcAbsOffsetPos(this.anchormax.get(),this.offsetmax.get())
            if(loc == Loc.NW || loc == Loc.NE){
                absOffsetHandlePos.y = minAbsOffsetPos.y
            }else{
                absOffsetHandlePos.y = maxAbsOffsetPos.y
            }
            if(loc == Loc.NW || loc == Loc.SW){
                absOffsetHandlePos.x = minAbsOffsetPos.x
            }else{
                absOffsetHandlePos.x = maxAbsOffsetPos.x
            }
            offsethandles[loc].pos.setHP(handled,absOffsetHandlePos)
        }

        var readAnchorHandleSetdata = (handled:boolean,loc:Loc) => {
            var handlePos = anchorhandles[loc].pos.get()
            var isMinDirty = false
            var isMaxDirty = false
            if(loc == Loc.NW || loc == Loc.NE){
                this.anchormin.get().y = inverselerp(this.parent.value.min.y,this.parent.value.max.y,handlePos.y) 
                isMinDirty = true
            }else{
                this.anchormax.get().y = inverselerp(this.parent.value.min.y,this.parent.value.max.y,handlePos.y) 
                isMaxDirty = true
            }
            if(loc == Loc.NW || loc == Loc.SW){
                this.anchormin.get().x = inverselerp(this.parent.value.min.x,this.parent.value.max.x,handlePos.x) 
                isMinDirty = true
            }else{
                this.anchormax.get().x = inverselerp(this.parent.value.min.x,this.parent.value.max.x,handlePos.x) 
                isMaxDirty = true
            }

            if(!handled){
                if(isMinDirty){
                    this.anchormin.box.boxtrigger()
                }
                if(isMaxDirty){
                    this.anchormax.box.boxtrigger()
                }
            }
        }

        var readOffsetHandleSetData  = (handled:boolean,loc:Loc) => {
            var handlePos = offsethandles[loc].pos.get()
            var absAnchorMin = this.calcAbsAnchorPos(this.anchormin.get())
            var absAnchorMax = this.calcAbsAnchorPos(this.anchormax.get())
            this.offsetmin
            this.offsetmax
            var isMinDirty = false
            var isMaxDirty = false
            if(loc == Loc.NW || loc == Loc.NE){
                this.offsetmin.get().y = to(absAnchorMin.y,handlePos.y)
                isMinDirty = true
            }else{
                this.offsetmax.get().y = to(absAnchorMax.y,handlePos.y)
                isMaxDirty = true
            }
            if(loc == Loc.NW || loc == Loc.SW){
                this.offsetmin.get().x = to(absAnchorMin.x,handlePos.x)
                isMinDirty = true
            }else{
                this.offsetmax.get().x = to(absAnchorMax.x,handlePos.x)
                isMaxDirty = true
            }

            if(!handled){
                if(isMinDirty){
                    this.offsetmin.box.boxtrigger()
                }
                if(isMaxDirty){
                    this.offsetmin.box.boxtrigger()
                }
            }
        }

        //update functions----------------------------------------------
        var updateAbsRect = this.updateAbsRect.bind(this)

        //parent-------------------------------
        this.parent.onchange.listen((val,old) => {
            this.anchorchangeenabled = false
            updateAnchorHandles(false)
            this.anchorchangeenabled = true
            updateAbsRect(false)
            this.offsetchangeenabled = false
            updateOffsetHandles(false)
            this.offsetchangeenabled = true
            updateDragHandle(false)
        })

        //absrect-------------------------------
        this.absRect.onchange.listen((e,old) => {
            updateOffsetHandles(e.handled)
            updateDragHandle(e.handled)
        })


        this.anchormin.onchange.listen(e => {
            updateAnchorHandle(e.handled,Loc.NW)
            updateAnchorHandle(e.handled,Loc.NE)
            updateAnchorHandle(e.handled,Loc.SW)
            updateAbsRect(e.handled)
            updateDragHandle(e.handled)
        })

        this.anchormax.onchange.listen(e => {
            updateAnchorHandle(e.handled,Loc.SE)
            updateAnchorHandle(e.handled,Loc.NE)
            updateAnchorHandle(e.handled,Loc.SW)
            updateAbsRect(e.handled)
            updateDragHandle(e.handled)
        })
        
        this.offsetmin.onchange.listen(e => {
            updateOffsetHandle(e.handled,Loc.NW)
            updateOffsetHandle(e.handled,Loc.NE)
            updateOffsetHandle(e.handled,Loc.SW)
            updateAbsRect(e.handled)
            updateDragHandle(e.handled)
        })

        this.offsetmax.onchange.listen(e => {
            updateOffsetHandle(e.handled,Loc.SE)
            updateOffsetHandle(e.handled,Loc.NE)
            updateOffsetHandle(e.handled,Loc.SW)
            updateAbsRect(e.handled)
            updateDragHandle(e.handled)
        })


        function processAnchorHandleChange(e:PEvent<Vector>,dir:Loc){
            if(that.anchorchangeenabled){
                // var cwDir = dirmap[dir][0]
                // var ccwDir = dirmap[dir][1]
                // readAnchorHandleSetdata(e.handled,dir)
                // updateOffsetHandle(e.handled,dir)
                // updateOffsetHandle(e.handled,cwDir)
                // updateOffsetHandle(e.handled,ccwDir)


                readOffsetHandleSetData(e.handled,dir)
                readAnchorHandleSetdata(e.handled,dir)
            }
        }

        handleanchormin.pos.onchange.listen(e => {
            processAnchorHandleChange(e,Loc.NW)
        })

        handleanchortopright.pos.onchange.listen(e => {
            processAnchorHandleChange(e,Loc.NE)
        })

        handleanchormax.pos.onchange.listen(e => {
            processAnchorHandleChange(e,Loc.SE)
        })

        handleanchorbotleft.pos.onchange.listen(e => {
            processAnchorHandleChange(e,Loc.SW)
        })

        function processOffsetHandleChange(e:PEvent<Vector>,dir:Loc){
            if(that.offsetchangeenabled){
                var cwDir = dirmap[dir][0]
                var ccwDir = dirmap[dir][1]
            
                readOffsetHandleSetData(e.handled,dir)
                updateAbsRect(e.handled)

                updateOffsetHandle(e.handled,cwDir)
                updateOffsetHandle(e.handled,ccwDir)
            }
        }

        handleoffsetmin.pos.onchange.listen(e => {
            processOffsetHandleChange(e,Loc.NW)
        })

        handleoffsettopright.pos.onchange.listen(e => {
            processOffsetHandleChange(e,Loc.NE)
        })

        handleoffsetmax.pos.onchange.listen(e => {
            processOffsetHandleChange(e,Loc.SE)
        })

        handleoffsetbotleft.pos.onchange.listen(e => {
            processOffsetHandleChange(e,Loc.SW)
        })

        //draghandle--------------------
        draghandle.pos.onchange.listen(e => {
            var source = this.absRect.box.value.getPoint(new Vector(0.5,0))
            var offset = source.to(e.val)
            this.offsetmin.setHP(e.handled,this.offsetmin.box.value.c().add(offset))
            this.offsetmax.setHP(e.handled,this.offsetmax.box.value.c().add(offset))
            updateOffsetHandles(e.handled)
            updateAbsRect(e.handled)
        })

        return handles
    }

    draw(ctxt:CanvasRenderingContext2D){
        var absrect = this.absRect.get() //this.calcAbsRect(this.parent.get())
        var size = absrect.size()
        ctxt.strokeRect(Math.floor(absrect.min.x) + 0.5,Math.floor(absrect.min.y) + 0.5,size.x,size.y)
        this.children.forEach(c => c.draw(ctxt))
    }

    calcAbsAnchorPos(anchor:Vector):Vector{
        return this.uirectlerp(this.parent.get().min,this.parent.get().max,anchor)
    }

    calcAbsOffsetPos(anchor:Vector,offset:Vector):Vector{
        return this.calcAbsAnchorPos(anchor).add(offset)
    }

    calcAbsRect():Rect{
        var absmin = this.calcAbsOffsetPos(this.anchormin.get(),this.offsetmin.get())
        var absmax = this.calcAbsOffsetPos(this.anchormax.get(),this.offsetmax.get())
        return new Rect(absmin,absmax)
    }

    uirectlerp(a:Vector,b:Vector,w:Vector):Vector{
        return new Vector(lerp(a.x,b.x,w.x),lerp(a.y,b.y,w.y))
    }

    uirectInvlerp(a:Vector,b:Vector,w:Vector){
        return new Vector(inverselerp(a.x,b.x,w.x),inverselerp(a.y,b.y,w.y))
    }

}