var express = require('express');
const pool = require('./pool');
var router = express.Router();
const { v4: uuid, parse } = require("uuid");

/* Function for the formatted date and time  */
function getFormattedDateTime() {
  const currentDate = new Date();
  
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, '0');
  const day = String(currentDate.getDate()).padStart(2, '0');
  
  const hours = String(currentDate.getHours()).padStart(2, '0');
  const minutes = String(currentDate.getMinutes()).padStart(2, '0');
  const seconds = String(currentDate.getSeconds()).padStart(2, '0');
  
  const formattedDateTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  
  return formattedDateTime;
}

/* Rendering the home page */

router.get ('/',(req,res)=>{
  res.render ('home');
})



/* Rendering the create user page */

router.get ('/createUser',(req,res)=>{

  let error = "";

  if (req.query.error){
    error = req.query.error
  }

  res.render ('create' , {error : error})
})



/* Rendering the users page */

router.get ('/users',(req,res)=>{

  pool.query ('select * from users',(err,obj)=>{
    if (err){
      console.log (err);
      res.render ('users' , {data : []});
    }

    else{

      res.render ('users' , {data : obj})
    }
  })
})


/* Rendering the transactions page */

router.get ('/transactions',(req,res)=>{
  res.render ('transact');
})



/* Rendering the history page */

router.get ('/history',(req,res)=>{

  pool.query ('select * from transactions' ,(err,obj)=>{
    if (err){
      console.log (err);
      res.render ('history' , {data : []});
    }

    else{
      res.render ('history' , {data : obj});

    }
  })
})


/* Creating user form */

router.post ('/createUserForm',(req,res)=>{
  const text = req.body;

  pool.query (`select * from users where email = ?`,[text.email],(err,obj)=>{
    if (err){
      console.log (err);
      res.redirect ('/createUser?errror=1');
    }

    else{
      if (obj.length == 0){
        pool.query ('insert into users (name , email , balance ) values (?,?,?)',[text.name , text.email , text.balance],(err2,obj2)=>{
          if (err2){
            console.log (err2);
            res.redirect ('/createUser?error=1');
          }

          else{
            res.redirect('/createUser?error=2')
          }
        })
      }

      else{
        res.redirect('/createUser?error=3')
      }
    }
  })
})



/* For Transfering the amount */

router.post ('/transferAmount',(req,res)=>{
  const text = req.body;

  pool.query ('select * from users where accNumber = ?',[text.sender], (err,obj)=>{
    if (err){
      console.log (err);
      res.send ({error : "A Server Error Has Occured !" , eid : 0});
    }

    else{

      if (parseInt (obj[0].balance) < text.amount){
        res.send ({error : "Sender has Insufficient Balance !" , eid : 0});
      }

      else{
        pool.query ('update users u1, users u2 set u1.balance = u1.balance - ? , u2.balance = u2.balance + ? where u1.accNumber = ? and u2.accNumber = ?',[text.amount, text.amount, text.sender , text.receiver], (err2,obj2)=>{
          if (err2){
            console.log (err2);

            res.send ({error : "A Server Error Has Occured !", eid : 0});
          }

          else{

            let ref = uuid();
            let time = getFormattedDateTime ();

            pool.query (`insert into transactions  ( sender, receiver, time, amount , refId , sendAcc, recAcc) values ((select email as sender from users where accNumber = ${text.sender}) ,(select email from users where accNumber = ${text.receiver}),?,?,?,?,? )`,[time, text.amount, ref,text.sender, text.receiver], (err3,obj3)=>{})

            res.send ({error : `Amount Has Been Transfered Successfully ! Ref Id : ${ref}` , eid : 1});
          }
        })
      }
    }
  })
})

module.exports = router;
