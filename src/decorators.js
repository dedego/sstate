const createDecorators = store => {

    const classDecorator = (Class) => {
      Class.prototype.setState = store.setState.bind(store);
      Class.prototype.exec = store.exec.bind(store);
      Class.prototype.setNext = (key,next) => {
        Object.defineProperty(Class, key, {
          value: next,
          configurable: true,
          writable: true
        });     
        console.log(Class);   
      }
    
    };

    const propDecorator = value => {
      return (target, name, descriptor) => {
        store.subscribe(value, next => target.setNext(name, next));
        return {
          ...descriptor,
          initializer: () => store.getState(value)
        }
      }
    }

    return [ classDecorator, propDecorator ];

};

export default createDecorators;
export { createDecorators }