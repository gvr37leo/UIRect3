enum Justification{
    start,
    end,
    center,
    spacebetween,
    spacearound,
    spaceevenly,
}

enum Alignment{
    start,
    end,
    center,
    stretch,
}

class FlexBox{
    public AlignItems:Alignment = Alignment.center
    children: UIRect[];
    draw: any;

    constructor(public uirect:UIRect, public justifyContent:Justification){
        this.draw = this.uirect.draw.bind(uirect)
        this.children = uirect.children
        for(var child of this.children){
            child.anchormin.set(new Vector(0,0))
            child.anchormax.set(new Vector(0,0))
        }

        var posses = [this.positionStart,this.positionEnd,this.positionCenter,this.positionBetween,this.positionAround,this.positionEvenly].map(p => p.bind(this))
        this.uirect.absRect.onchange.listen((val,old) => {
            
            var rects = posses[this.justifyContent]()
            for(var i = 0; i < rects.length; i++){
                this.children[i].offsetmin.set(rects[i].min)
                this.children[i].offsetmax.set(rects[i].max)
            }
        })
        
        this.uirect.absRect.box.boxtrigger()
    }

    width(){
        return this.uirect.absRect.get().size().x
    }

    positionStart(){
        return this.spaceBlocks(0,0)
    }

    freespace(margin:number){
        return this.width() - this.calcChildrenWidth(margin)
    }

    positionEnd(){
        return this.spaceBlocks(this.freespace(0),0)
    }

    positionCenter(){
        var width = this.calcChildrenWidth(0)
        var center = this.uirect.absRect.get().size().scale(0.5)
        return this.spaceBlocks(center.x - width / 2,0)
    }

    positionBetween(){
        return this.spaceBlocks(0, this.freespace(0) / (this.children.length - 1))
    }

    positionAround(){
        var freespacePerBlock = this.freespace(0) / this.children.length
        return this.spaceBlocks(freespacePerBlock / 2, freespacePerBlock)
    }

    positionEvenly(){
        var freespacepergap = this.freespace(0) / (this.children.length + 1)
        return this.spaceBlocks(freespacepergap,freespacepergap)
    }

    spaceBlocks(begin:number,margin:number):Rect[]{
        var result:Rect[] = []
        var current = begin
        
        for(var rect of this.children){
            var size = rect.absRect.get().size()
            var start = current
            var end = start + size.x
            result.push(new Rect(new Vector(start,0),new Vector(end,size.y)))
            current += size.x + margin
        }
        return result
    }

    // calcTopBottom(alignment:Alignment, rect:Rect):[number,number]{
        // var bot = 0;
        // var size = rect.size()

        // var top = this.rect.value.size().y
        // switch(alignment){
        //     case Alignment.start:{
        //         return [bot,size.y];
        //     }
        //     case Alignment.end:{
        //         return [top - size.y, top];
        //     }
        //     case Alignment.center:{
        //         var center = top / 2
        //         var halfsize = size.y / 2
        //         return [center - halfsize, center + halfsize];
        //     }
        //     case Alignment.stretch:{
        //         return [bot,top];
        //     }
        // }
    // }

    calcChildrenWidth(margin:number){
        return this.children.reduce((p,c) => p += c.absRect.get().size().x,0) + max(this.children.length - 1,0) * margin
    }
}