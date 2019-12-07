const createDecorators = store => {

    const classDecorator = target => {
        target.setState = store.setState;
        target.exec = store.exec;
    };

    const propDecorator = value => {
        return target => {
        const { descriptor } = target
        const initializer = () => store.getState(value);
        store.subScribe(value, next => descriptor.value = next);
      
        return {
          ...target,
          descriptor: {
            ...target.descriptor,
            writable: false,
            initializer,
          }
        }
      }
    }

    return [ classDecorator, propDecorator ];

};

export default createDecorators;
export { createDecorators }