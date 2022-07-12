import EventEmitter from "events";


const emitter = new EventEmitter();


export enum Event {
    INIT = "init",
    CLEANUP = "cleanup"
}


export default emitter.on;


export function emit(event: Event) {
	emitter.emit(event);
}

// TODO: Default handlers (file instructions?)