import express from 'express';
import router from './server/src/routes/index';
const app = express();
app.use('/api/v1', router);
app._router.stack.forEach((r: any) => {
  if (r.route) {
    console.log(r.route.path);
  } else if (r.name === 'router') {
    r.handle.stack.forEach((sr: any) => {
       if (sr.route) {
         console.log('  ' + sr.route.path);
       } else if (sr.name === 'router') {
         console.log('  Router: ' + sr.regexp);
       }
    });
  }
});
