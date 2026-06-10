fetch('http://127.0.0.1:8000/stephan_e_perez/faces').then(r=>r.text()).then(t=>{
    const start = t.indexOf('<div id="app"');
    const end = t.indexOf('</div>', start);
    console.log('App Div Content Length: ', end - start - 13);
})
