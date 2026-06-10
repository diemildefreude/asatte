fetch('http://127.0.0.1:8000/sitemap.xml').then(r=>r.text()).then(t=>{
    console.log(t.substring(0, 200));
})
