let Promise = require('./myPromise');
let p = new Promise(function (resolve, reject) {
    resolve('test success');
});
p.then(function (data) {
    console.log('success:', data);
}, function (err) {
    console.log('fail:', err);
});