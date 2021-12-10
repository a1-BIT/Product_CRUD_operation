var express = require('express');
var bodyParser = require('body-parser');
var mongojs = require('mongojs');
var app = express();
var port = process.env.port || 7000;
var urlencoderParser = bodyParser.urlencoded({ extended: false });
// app.use(bodyParser.urlencoded({ extended: true }))
const bycrypt = require('bcryptjs')
var ObjectId = require('mongodb').ObjectId; 


app.use('/static', express.static(__dirname + '/public'));
app.set('view engine', 'ejs');
var db = mongojs('meandb', ['employee']);



app.get('/', function (req, res) {
    res.render('login');
});


app.post('/login', urlencoderParser, function (req, res) {
    var e = req.body.email;
    db.users.findOne({ "email": e }, function (err, doc) {
        if (doc != null || doc != '') {
            const verified = bycrypt.compareSync(req.body.password, doc.password);
            if (verified){
                    if(doc.user_type == 1)
                        res.redirect("/admin-dashboard");
                     else   
                        res.redirect("/my-product");
            }else{
                res.redirect("/");
            }


        }


    });

});

app.get('/register', function (req, res) {
    res.render('register');
});


app.post('/register', urlencoderParser, async function (req, res) {
    const salt = await bycrypt.genSalt(10);
    hashpassword = await bycrypt.hash(req.body.password, salt)

    let full_name = req.body.fullname;
    let email = req.body.email;
    let mobile = parseInt(req.body.mobile);


    db.users.insert({ "fullname": full_name, "email": email, "mobile": mobile, "password": hashpassword,"user_type":req.body.user_type}, function (err, doc) {
        res.redirect('/');
    });
});



app.get('/create', function (req, res) {
    res.render('create');
});

//listing product
app.get('/my-product', function (req, res) {
    db.product.find(function (err, docs) {
        return res.render('index', { products_data: docs });
    });
});


//listing admin product
app.get('/admin-dashboard', function (req, res) {
    db.product.find(function (err, docs) {
        return res.render('admin-dashboard', { products_data: docs });
    });
});

//update product
app.get('/approve_product/:id', urlencoderParser, function (req, res) {
    db.product.findAndModify({
        query: { "_id":ObjectId(req.params.id)},
        update: { $set: { is_approved:'approved'}},
        new: true
    },
        function (err, doc) {
            res.redirect("/admin-dashboard");
        });
});



//product create
app.post('/create', urlencoderParser, function (req, res) {
    let pid = req.body.pid;
    let p_name = req.body.name;
    let brand = req.body.brand;
    let desc = req.body.desc;
    db.product.insert({ "pid": pid, "product_name": p_name, "product_brand": brand, "product_description": desc, "is_approved": 'Pending' }, function (err, result) {
        if (err) throw err;
        res.redirect("/my-product");
    });
});

// edit product
app.get('/edit/:id', function (req, res) {
    db.product.findOne({ "_id":ObjectId(req.params.id)}, function (err, doc) {
        res.render('update', { product: doc });
    });
});



//update product
app.post('/update', urlencoderParser, function (req, res) {
    let pid = req.body.pid;
    let p_name = req.body.name;
    let brand = req.body.brand;
    let desc = req.body.desc;
    db.product.findAndModify({
        query: { "_id":ObjectId(req.body.id)},
        update: { $set: { pid:pid,product_name:p_name,product_brand:brand,product_description:desc}},
        new: true
    },
        function (err, doc) {
            res.redirect("/my-product");
        });
});

 
//delete product
app.get('/delete/:id', urlencoderParser, function (req, res) {
    db.product.remove({ "_id":ObjectId(req.params.id)}, function (err, doc) {
        res.redirect("/my-product");
    });
});



app.listen(port);

console.log("Server started at : http://127.0.0.1:" + port);