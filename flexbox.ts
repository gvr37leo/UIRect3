// enum Justification{
//     start,
//     end,
//     center,
//     spacebetween,
//     spacearound,
//     spaceevenly,
// }

// enum Alignment{
//     start,
//     end,
//     center,
//     stretch,
// }

// class FlexBox{
//     public justifyContent:Justification = Justification.start
//     public AlignItems:Alignment = Alignment.center
    
//     constructor(public uirect:UIRect,public rects:UIRect[]){
        
//     }

//     draw(){

//     }

//     positionStart(){
//         return this.spaceBlocks(0,0)
//     }

//     positionEnd(){
//         var freespace = this.freespace(this.widthOfBlocks())
//         return this.spaceBlocks(freespace,0)
//     }

//     positionCenter(){
//         var width = this.widthOfBlocks()
//         // var center = this.rect.value.size().scale(0.5)
//         // return this.spaceBlocks(center.x - width / 2,0)
//     }

//     positionBetween(){
//         var freespacePerBlock = this.freespacePerBlock()
//         return this.spaceBlocks(0, 0)
//     }

//     positionAround(){
//         var freespacePerBlock = this.freespacePerBlock()
//         return this.spaceBlocks(freespacePerBlock / 2, freespacePerBlock)
//     }

//     positionEvenly(){
//         var gaps = this.rects.length + 1;
//         var freespace = this.freespace(this.widthOfBlocks());
//         var freespacePerGap = freespace / gaps;
//         return this.spaceBlocks(freespacePerGap, freespacePerGap);
//     }

//     spaceBlocks(begin:number,skip:number):Rect[]{
//         var result:Rect[] = []
//         var current = begin
        
//         for(var rect of this.rects){
//             var topbottom = this.calcTopBottom(this.AlignItems, rect.absRect.value)
//             var size = rect.absRect.value.size()
//             var start = current
//             var end = start + size.x
//             result.push(new Rect(new Vector(start,topbottom[0]),new Vector(end,topbottom[1])))
//             current += size.x + skip
//         }
//         return result
//     }

//     calcTopBottom(alignment:Alignment, rect:Rect):[number,number]{
//         var bot = 0;
//         var size = rect.size()

//         var top = this.rect.value.size().y
//         switch(alignment){
//             case Alignment.start:{
//                 return [bot,size.y];
//             }
//             case Alignment.end:{
//                 return [top - size.y, top];
//             }
//             case Alignment.center:{
//                 var center = top / 2
//                 var halfsize = size.y / 2
//                 return [center - halfsize, center + halfsize];
//             }
//             case Alignment.stretch:{
//                 return [bot,top];
//             }
//         }
//     }

//     widthOfBlocks(){
//         return this.rects.reduce<number>((p,c) => p += c.absRect.value.size().x, 0)
//     }

//     freespace(widthOfBlocks:number){
//         return this.rect.value.size().x - widthOfBlocks
//     }

//     freespacePerBlock(){
//         return this.freespace(this.widthOfBlocks()) / this.rects.length
//     }
// }