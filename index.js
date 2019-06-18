import { Sshtate } from './src/index';

const Food = new Sshtate({ 
    bread: { 
        baguette: 2, 
        loaf: 6 
    }, 
    fruit: { 
        apples: 11, 
        bananas: 1 
    } 
});

const logChange = (prefix, data) => console.log(prefix, data);

Food.subscribe('subscriptionId1', 'bread.loaf', data => logChange('subscriptionId1:', data));
Food.subscribe('subscriptionId2', 'bread.loaf', data => logChange('subscriptionId2:', data));

Food.setState('bread.loaf', 25);
Food.setState('bread.loaf', 23);

Food.unsubscribe('subscriptionId1', 'bread.loaf');
console.log('Unsubscribed subscriptionId1');

Food.setState('bread.loaf', 21);
Food.setState('bread.loaf', 24);

console.log('Complete state:', Food.getState());