import { Sstate } from './dist/index.m';

const Food = new Sstate({ 
    bread: { 
        baguette: 2, 
        wholeWeat: 6 
    }, 
    fruit: { 
        apples: 11, 
        bananas: 1 
    } 
});

const logChange = (prefix, data) => console.log(prefix, data);

Food.subscribe('subscriptionId1', 'bread.wholeWeat', data => logChange('subscriptionId1:', data));
Food.subscribe('subscriptionId2', 'bread.wholeWeat', data => logChange('subscriptionId2:', data));

Food.setState('bread.wholeWeat', 25);
Food.setState('bread.wholeWeat', 23);

Food.unsubscribe('subscriptionId1', 'bread.wholeWeat');
console.log('Unsubscribed subscriptionId1');

Food.setState('bread.wholeWeat', 21);
Food.setState('bread.wholeWeat', 24);

console.log('Complete state:', Food.getState());