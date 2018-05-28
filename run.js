let Promise = require('./myPromise');
let p = new Promise(function (resolve, reject) {
    setTimeout(function () {
        resolve('test success');
    },1000);
});
p.then(function (data) {
    console.log('success:', data);
}, function (err) {
    console.log('fail:', err);
});