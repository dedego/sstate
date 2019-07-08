## Changelog

| Version | Changes                                                                          |
| ------- | -------------------------------------------------------------------------------- |
| 0.1.0   | Initial version of Sstate                                                        |
| 0.2.0   | Improved subscription to not rely on a DOM node for more Generic use             |
| 0.2.1   | Fixed the getState in case it is called with a non existing path                 |
| 0.3.0   | Allow for eassier unsubscribe, see [subscribe](#subscribe)                       |
| 1.0.0   | Simplified the API, removed unsubscribe, removed unique subscriptionId           |
| 1.0.1   | Removed unsubscribe from the example                                             |
| 1.0.2   | Improved unset, fixed documentation, added utility tests                         |
| 1.0.3   | Replaced microbundle in favor of rollup                                          |
| 1.0.4   | Replaced CJS by UMD build only                                                   |
| 1.0.5   | Corrected the subscription callback method, changed the UUID generation          |
| 1.1.0   | Introduced [actions](#exec)                                                      |
| 1.1.1   | Fixed the state returned in getState and the action(s) to be immutable           |
| 1.1.2   | Fixed typo in the unique keys for subscription, added aditional info on getState |
| 1.2.0   | Added parameters for `exec`, which are accessable in your actions                |
| 1.2.1   | Changed object.assign to deepClone to make sure we dont deal with references     |
| 1.2.2   | Improved validation of the action before execution                               |
| 1.2.3   | Allow chaining of `exec`ution of actions                                         |
| 1.2.4   | Moved to GitHub                                                                  |
| 1.2.5   | Corrected repo in package.json, corrected description                            |
