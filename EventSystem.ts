class Box<T>{
    onchange: EventSystem<T>
    onClear: EventSystemVoid
    value: T
    oldValue:T
    isSet: boolean = false

    constructor(value: T) {
        this.onchange = new EventSystem();
        this.value = value
        this.onClear = new EventSystemVoid();
    }

    get(): T {
        return this.value
    }

    set(value: T, silent: boolean = false) {
        this.oldValue = this.value
        this.value = value
        if (this.oldValue != value || !this.isSet) {
            this.isSet = true;
            if (!silent) {
                this.onchange.trigger(this.value,this.oldValue)
            }
        }
    }

    clear() {
        this.isSet = false
        this.set(null)
        this.onClear.trigger()
    }

    boxtrigger(){
        this.onchange.trigger(this.value,this.oldValue)
    }
}

class EventSystem<T>{
    callbacks: ((val: T, old:T) => void)[] = []

    constructor() {

    }

    listen(callback: (val: T, old:T) => void) {
        this.callbacks.push(callback)
    }

    deafen(callback: (val: T, old:T) => void) {
        this.callbacks.splice(this.callbacks.findIndex(v => v === callback), 1)
    }

    trigger(value: T, old:T) {
        for (var callback of this.callbacks) {
            callback(value,old)
        }
    }
}

class EventSystemVoid{
    callbacks: (() => void)[] = []

    constructor() {

    }

    listen(callback: () => void) {
        this.callbacks.push(callback)
    }

    deafen(callback: () => void) {
        this.callbacks.splice(this.callbacks.findIndex(v => v === callback), 1)
    }

    trigger() {
        for (var callback of this.callbacks) {
            callback()
        }
    }
}

class ObjectBox<T>{
    val:T
    isSet: boolean = false
    onChange:EventSystemVoid

    constructor(val:T){
        this.val = val
    }

    get<V>(selector:(obj:T) => Box<V>):V{
        return selector(this.val).get()
    }

    set<V>(selector:(obj:T) => Box<V>, val:V){
        var old = selector(this.val)
        old.set(val)
        if(old.get() != val || !this.isSet){
            this.isSet = true
            this.onChange.trigger()
        }
    }
}

class PEvent<T>{
    handled = false

    constructor(public val:T){

    }

    static create<T>(handled:boolean,val:T){
        var e = new PEvent(val)
        e.handled = handled
        return e
    }
}

class PBox<T>{
    private box:Box<PEvent<T>>
    onchange:EventSystem<PEvent<T>>

    constructor(val:T){
        this.box = new Box(new PEvent(val))
        this.onchange = this.box.onchange
    }

    get():T{
        return this.box.value.val
    }

    set(v:T){
        var e = new PEvent(v)
        e.handled = false
        this.box.set(e)
    }

    setS(e:PEvent<T>){
        this.box.set(e)
    }

    setHP(handled:boolean,val:T){
        this.setH(PEvent.create(handled,val))
    }

    setH(e:PEvent<T>){
        if(!e.handled){
            e.handled = true
            this.setS(e)
        }
    }
}