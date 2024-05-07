const document = BrowserTest.render("http/index.html");


new BrowserTest("Open")
.actual(document.querySelector("#modal").style.display).expected("block");