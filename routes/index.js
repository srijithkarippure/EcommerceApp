var express = require('express');
var router = express.Router();
var mysql = require('mysql');
//var validator = require("email-validator");



  var connectionPool =  mysql.createPool({
    connectionLimit: 500,
  host : 'DataReadBalancer-1414333519.us-east-1.elb.amazonaws.com',
  user : 'root',
  password: 'password',
  database : 'PRODUCT_INFO',
  port: 3306
  });

  var writeConnectionPool =  mysql.createPool({
    connectionLimit: 500,
  host : '54.87.129.152',
  user : 'root',
  password: 'password',
  database : 'PRODUCT_INFO',
  port: 3306
  });


router.post('/logout',function(req,res,next){
  if(req.session && req.session.username){
	req.session.destroy();
  res.send('You have been logged out');
}
else{
  res.send('You are not currently logged in');
}
});

router.post('/login',function(req,res,next){

	
try{
connectionPool.getConnection(function(err,conn){
  if(err){
    try{
    conn.release();
  }
  catch(e){

  }
    console.log('Error in getting connection from pool');
    return;
  }

var username = req.body.username;
var password = req.body.password;
console.log('UserName:' + username);
conn.query('SELECT firstname,password,role from USERS where username=?',username, function(err, rows, fields) {
  conn.release();
  if (!err){
  	if(rows.length != 1){
  		res.send('There seems to be an issue with the username/password combination that you entered');
  	}
    else{
  	if(rows[0].password === password) {
      var firstName = rows[0].firstname;

      //if(req.session && req.session.username === username){
        if(req.session && req.session.username === username){
          console.log('Fetching SESSION USERNAME FROM REDIS:' + req.session.username);
          console.log('User:' + username + ' already logged in. Killing session:' + req.sessionID);
          req.session.regenerate(function(err){
            console.log('SessionID after Regenerate:' + req.sessionID);
            req.session.username = username;
            req.session.admin = rows[0].role;
            res.send( 'Welcome ' + firstName);

        });
      }
      else{
      //var expiryTime =  15 * 60 * 1000; 
      //req.session.cookie.expires = new Date(Date.now() + expiryTime);
  		req.session.username = username;
      req.session.admin = rows[0].role;
      console.log( 'Initial SessionID:' + req.sessionID);
      res.send( 'Welcome ' + firstName);
    }
      //console.log('Req Admin role:' + req.session.admin);
      //console.log(' Created session:' + req.session.cookie.expires);
		  //res.send( 'Welcome ' + firstName);
    }
    else{
      res.send('There seems to be an issue with the username/password combination that you entered');
    }
  } 
}
 else{
      console.log('Error while performing query');
    }
    
});
});
}
catch(e){
  console.log('Exception caught' + e)
  
}


	
});


router.get('/', function(req, res, next) {
  res.status(200).send('{Message: Lets get going }');
});

router.get('/login',function(req,res){
  res.render('login');
});

router.get('/register',function(req,res){
  res.render('register');
});

router.post('/registerUser', validateRegister, function(req,res,next){
 writeConnectionPool.getConnection(function(err,conn){
  if(err){
    try{
    conn.release();
  }
  catch(e){}
    console.log('Error in getting connection from pool');
    return;
  }

  console.log('Connected to DB as :' + conn.threadId);
  console.log('Register UserName' + req.body.username);
  var record = {firstname: req.body.fname , lastname: req.body.lname, address: req.body.address, city: req.body.city, state: req.body.state,
    zip: req.body.zip, email: req.body.email, username: req.body.username, password: req.body.password};

    //console.log('Record:' + typeof record);
  conn.query('INSERT INTO USERS SET ?', record, function(err){
    conn.release();
    if(err){
      console.log('Error while persisting record' + err);
      res.send('There was a problem with this action');
    }
    else{
      console.log('Registered successfully');
      res.send('Your account has been registered');
    }
    
  });
  

 })

});

router.post('/updateInfo', function(req,res,next){
  if(req.session && req.session.username){

    console.log('First:' + req.body.firstname);
    if(typeof req.body.fname === 'undefined'){
     // record = record + 'firstname:'+ req.body.firstname + ',';
      //console.log('Record:' + record);
      req.body.fname = null;
    }
     if(typeof req.body.lname === 'undefined'){
      //record = record + 'lastname:' + req.body.lastname + ',';
      //console.log('Record:' + record);
      req.body.lname = null;
    }
     if(typeof req.body.address === 'undefined'){
    //record = record + 'address:' + req.body.address + ',';
      //console.log('Record:' + record);
      req.body.address = null;
    }
     if(typeof req.body.city === 'undefined'){
//record = record + 'city:' + req.body.city + ',';
      //console.log('Record:' + record);
      req.body.city= null;
    }
     if(typeof req.body.state === 'undefined'){
//record = record + 'state:' + req.body.state + ',';      //console.log('Record:' + record);
  req.body.state = null;
    }
     if(typeof req.body.zip === 'undefined') {
//record = record + 'zip:' + req.body.zip + ',';      //console.log('Record:' + record);
req.body.zip = null;
    }
     if(typeof req.body.email === 'undefined' ){
//record = record + 'email:' + req.body.email + ',';      //console.log('Record:' + record);
    req.body.email = null;
    }
     if(typeof req.body.username === 'undefined' ){
//record = record + 'username:' + req.body.username + ',';      //console.log('Record:' + record);
    req.body.username = null;
    }
     if(typeof req.body.password === 'undefined'){
      req.body.password = null;
//record = record + 'password:' + req.body.password + ',';      //console.log('Record:' + record);
    }

writeConnectionPool.getConnection(function(err,conn){
  if(err){
    try{
    conn.release();}catch(e){}
    console.log('Error in getting connection from pool');
    return;
  }
    console.log('Connected to DB as :' + conn.threadId);

  console.log(req.body.username);
  conn.query('UPDATE USERS SET firstname = IfNULL(?,firstname), lastname = IfNULL(?, lastname), address = IfNULL(?, address), state = IfNULL(?, state), city = IfNULL(?, city), zip = IfNULL(?, zip),'
    +' email = IfNULL(?, email), username = IfNULL(?, username), password = IfNULL(?, password) where username=?', [req.body.fname,req.body.lname,req.body.address,req.body.state,req.body.city,req.body.zip,req.body.email,req.body.username,req.body.password,req.session.username], function(err){
    conn.release();
    if(err){
      console.log('Error while persisting record' + err);
      res.send('There was a problem with this action');
    }
    else{
      console.log('Your information has been updated');
      if(typeof req.body.username !== 'undefined' || req.body.username !== ''){
      req.session.username = req.body.username;
    }
      res.send('Your information has been updated');

    }
    
  });

})
}
else{
  res.send('You must be logged in to perform this action');
}
});

router.post('/addProducts',function(req,res,next){
  //console.log('Req session:' + req.session);
  //console.log('Req admin:' + req.session.admin);
  if(req.session && req.session.admin == 1){
    if(req.body.asin === '' || typeof req.body.asin === 'undefined' || req.body.name === '' || typeof req.body.name ==='undefined' || req.body.productDescription === '' || typeof req.body.productDescription ==='undefined' || req.body.categories === '' || typeof req.body.categories ==='undefined'){
    console.log('All parameters required');
    res.send('There was a problem with this action');
    return;
  }
    var product_info = {asin: req.body.asin, name: req.body.name, productDescription: req.body.productDescription, categories: req.body.categories};
      writeConnectionPool.getConnection(function(err,conn){
  if(err){
    try{
    conn.release();}catch(e){}
    console.log('Error in getting connection from pool');
    res.send('There was a problem with this action');
    return;
  }
  conn.query('INSERT INTO PRODUCTS SET ?', product_info, function(err) {
  //conn.query('INSERT INTO PRODUCTS (productId, `name`, productDescription, `group`) values (?,?,?,?)', [req.body.productId,req.body.name,req.body.productDescription,req.body.group], function(err){
       conn.release();

    if(err){
      console.log('Error while persisting record' + err);
      res.send('There was a problem with this action');
    }
    else{
      //console.log('Registered successfully');
      res.send('The product has been added to the system');
    }
    });
});
  }
else if(req.session && req.session.admin ==0){
  res.send('Only admin can perform this action');
}
else{
  res.send('You must be logged in to perform this action');
}
});

router.post('/viewProducts', function(req,res,next){
  connectionPool.getConnection(function(err,conn){
  if(err){
    try{
    conn.release();
  }catch(e){}

    console.log('Error in getting connection from pool');
    return;
  }
  console.log('ConnectionID:' + conn.threadId);
  var executer='';
  if(typeof req.body.asin === 'undefined' && typeof req.body.categories ==='undefined' && typeof req.body.keyword === 'undefined'){
    executer = 'select name from PRODUCTS limit 1000;';
  }
  else{

   executer = 'select name from PRODUCTS where ';
   if(typeof req.body.asin !== 'undefined'){
    //req.body.productId = null;
    executer += 'asin = '+ conn.escape(req.body.asin)+' or';
  }
   if(typeof req.body.categories !== 'undefined'){
    //req.body.group = null;
    executer += ' `categories` = '+ conn.escape(req.body.categories)+' or';
  }
  if(typeof req.body.keyword !== 'undefined'){
    var word = req.body.keyword;
    var numberOfWords = req.body.keyword.split(" ");
    if(numberOfWords.length > 1){
      //console.log(word);
        if(word.charAt(0) !== '\"'){
        req.body.keyword = "\"" + req.body.keyword + "\"";
        }
    }
    executer += ' match(name,productDescription) against ('+ conn.escape(req.body.keyword) +') or';
  }
  executer = executer.slice(0,-2);
  executer += 'limit 1000;';
  }
console.log(executer);
conn.query(executer, function(err,results){
      conn.release();
if(!err){
  if(results.length > 0){
    var finalResults = "product_list:[{name:"
    for(var i=0;i<results.length;i++){
      if(i){
        finalResults += ',{name:';
      }
      finalResults+=results[i]["name"];
      finalResults+= '}'

    }
    finalResults+= ']'
    res.send(finalResults);
  }

  else{
    res.send('There were no products in the system that met that criteria');
  }
  
}
else{
  console.log(err);
  res.send('Issue while performing query');
}
})  

});
});

router.post('/buyProducts',function(req,res,next){
if(req.session && req.session.admin == 0){
console.log('ASIN:' + req.body.asin);
if(typeof req.body.asin === 'undefined'){
  res.send('There was a problem with this action');
  return;
}
var buyProduct = req.body.asin;
    if(buyProduct.charAt(0) =='['){
      buyProduct = buyProduct.slice(1,-1);
    }
    console.log('Buy Product:' + buyProduct);
    var array = buyProduct.split(",");
  updatePurchaseProducts(req.session,array,function(err,data){
    if(!err){
      updateRecommendations(req.body,array,function(err,data){
        if(!err)
          res.send('The product information has been updated');
        else
          res.send('There was a problem with this action');
      });
      
    }
    else{
      //console.log('PRODUCT UPDATE ERROR');
      res.send('There was a problem with this action');
    }
  });
    }
});

function updatePurchaseProducts(session,array,fn){

    writeConnectionPool.getConnection(function(err,conn){
  if(err){
    try{
    conn.release();}catch(e){}
    console.log('Error in getting connection from pool');
    return;
  }
  console.log('ConnectionID:' + conn.threadId);
  var total = 0;
  var insert = "";
    for( i=0; i < array.length ; i++){

       if(total){
              insert +=',';
               }
      insert += `('${session.username}','${array[i]}')`
      total++;
       }
       console.log('INSERT:' + insert);
      conn.query('INSERT INTO PURCHASED_PRODUCTS (username, asin) values ' + insert ,function(err){
        conn.release();
        if(err){
          //console.log(query.sql);
          console.log(err.message);
          return fn(new Error('There was a problem with this action'));
        }
        else{
          return fn(null,true);
        }
      });
});
  }

  function updateRecommendations(session,array,fn){
  console.log('In Reco Update');
  var list = array.slice().sort();
   var unique = [];
            for ( var i = 0; i < list.length; i++) {
                if (i+1 < list.length && list[i + 1] == list[i]) {
                    continue;
                }
                unique.push(list[i]);
              }
              console.log(unique);
if(unique.length > 1){
    writeConnectionPool.getConnection(function(err,conn){
  if(err){
    try{
    conn.release();}catch(e){}
    console.log('Error in getting connection from pool');
    return;
  }
    var total=0;
    var recos="";
    for( var i=0;i<unique.length;i++){
            for( var j=0;j<unique.length;j++){
              if(i==j)
                continue;
           if(total){
                recos +=',';
                
              }
              recos +=`('${unique[i]}','${unique[j]}')`;
              total++;
      }
    }
    console.log(recos);
    conn.query('INSERT INTO RECOMMENDATIONS (asin,alsoBought) values' + recos,function(err){
      conn.release();
      if(err){
        console.log(err.message);
        return fn(new Error('There was a problem with this action'));
      }
      else{
        return fn(null,true);
      }
    });
  });
  
}
  }



router.post('/getRecommendations',function(req,res,next){
  connectionPool.getConnection(function(err,conn){
  if(err){
    try{
    conn.release();}catch(e){}
    console.log('Error in getting connection from pool');
    return;
  }
if(typeof req.body.asin !== 'undefined'){
  var executer = 'select name from PRODUCTS p join (select alsobought from RECOMMENDATIONS where asin='+conn.escape(req.body.asin)+' group by alsobought limit 5) as r on p.asin = r.alsobought;'
  console.log(executer);
  conn.query(executer,function(err,results){
      conn.release();
      if(!err){
        if(results.length > 0){
    var finalResults = "";
    for(var i=0;i<results.length;i++){
      if(i){
        finalResults += ',';
      }
      finalResults+=results[i]["name"];

    }
    res.send(finalResults);
  }
      }
      else{
        console.log(err);
        res.send('There was a problem with this action');
      }
    });
}
else{
  res.send('There was a problem with this action');
}

});
});

router.post('/productsPurchased',function(req,res,next){
  if(req.session && req.session.admin ==1){
    if(typeof req.body.username !== 'undefined'){
       connectionPool.getConnection(function(err,conn){
  if(err){
    try{
    conn.release();}catch(e){}
    console.log('Error in getting connection from pool');
    return;
  }
var executer = 'select P.name,count(*) as quantity from PURCHASED_PRODUCTS PS, PRODUCTS P where PS.username=' + conn.escape(req.body.username)+' and PS.asin = P.asin group by username,name;'
 conn.query(executer,function(err,results){
      conn.release();
      if(!err){
        res.send(results);
      }
      else{
        res.send('There was a problem with this action');
      }
    });
});
    }
    else{
      res.send('There was a problem with this action');
    }
  }
  else{
    res.send('There was a problem with this action');
  }
});

router.post('/viewUsers', function(req,res,next){
if(req.session && req.session.admin ==1){
  connectionPool.getConnection(function(err,conn){
  if(err){
    try{
    conn.release();}catch(e){}
    console.log('Error in getting connection from pool');
    return;
  }

var executer = '';
if(typeof req.body.fname === 'undefined' && typeof req.body.lname === 'undefined'){
  executer = 'select firstname,lastname from USERS';
}
else{
    executer = 'select firstname,lastname from USERS where';
  if(typeof req.body.fname !== 'undefined'){
    var fname = '%' + req.body.fname + '%';
    executer += ' firstname like '+conn.escape(fname)+' or';
  }
   if(typeof req.body.lname !== 'undefined'){
    var lname = '%' + req.body.lname + '%';
    executer += ' lastname like '+conn.escape(lname)+' or';
  }
  executer = executer.slice(0,-2);
}
console.log(executer);
conn.query(executer,function(err,results){
      conn.release();
if(!err){
  // if(results.length > 0){
    var userList = [];
    for (var i =0 ; i < results.length; i++) {
      userList.push('{fname:' + results[i].firstname + ',lname:' + results[i].lastname + '}');
    }
    res.send(userList);
  //}
  //else{
    //res.send('There are no users matching your search criteria');
  //}
}
else{
  console.log(err);
  res.send('Issue while performing query');
}
});
})
}
else if(req.session && req.session.admin == 0){
  res.send('Only admin can perform this action');
}
else{
  res.send('You must be logged in to perform this action');
}
}) ;

router.post('/modifyProduct', function(req,res,next){

  if(req.session && req.session.admin ==1) {
  if(typeof req.body.name === 'undefined' || typeof req.body.productDescription === 'undefined' ||typeof req.body.asin === 'undefined'){
    console.log('In validation');
    res.send('There was a problem with this action');
    return;
  }
  connectionPool.getConnection(function(err,conn){
  if(err){
    try{
    conn.release();}catch(e){}
    console.log('Error in getting connection from pool');
    return;
  }
//var record = {name:req.body.name, productDescription: req.body.productDescription};
console.log('Executing Update' + req.body.name + ' ' + req.body.productDescription + '  ' + req.body.asin);
conn.query('update `PRODUCTS` set `productDescription` = ?,`name` = ? where `asin` = ?' ,[req.body.productDescription, req.body.name, req.body.asin], function(err){
    conn.release();
if(!err){

  res.send('The product information has been updated');
}
else{
  console.log(err);
  res.send('There was a problem with this action');
}
})  
//conn.release();
});
}
else if (req.session && req.session.admin ==0){
  res.send('Only admin can perform this action');
}
else{
  res.send('You must be logged in to perform this action');
}
});



function validateRegister(req,res,next){
  if(typeof req.body.fname === 'undefined' || typeof req.body.lname === 'undefined' ||typeof req.body.address === 'undefined' || 
    typeof req.body.city === 'undefined' ||typeof req.body.zip === 'undefined' || typeof req.body.email === 'undefined' ||
    typeof req.body.username === 'undefined' ||typeof req.body.password === 'undefined'){
    console.log('In validateRegister');
    res.send('There was a problem with your registration');
    return;
  }
 else if( req.body.fname === '' ||  req.body.lname === '' || req.body.address === '' || 
     req.body.city === '' || req.body.zip === '' ||  req.body.email === '' ||
     req.body.username === '' || req.body.password === ''){
    console.log('In validateRegister');

    res.send('There was a problem with your registration');
    return;
  }
  else{
    next();
  }
}



module.exports = router;
