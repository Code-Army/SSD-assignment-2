!function(){
    
    
    const e=document,
    t=e.documentElement,
    n=e.body,
    i=e.getElementById("lights-toggle"),
    s=window.sr=ScrollReveal();
   
    
    
    t.classList.remove("no-js"),
    t.classList.add("js"),
    window.addEventListener("load",function(){
        
        n.classList.add("is-loaded")
    
    }),
    
    n.classList.contains("has-animations")&&window.addEventListener("load",function(){
        
        s.reveal(".feature",{duration:600,distance:"20px",easing:"cubic-bezier(0.215, 0.61, 0.355, 1)",origin:"right",viewFactor:.2})}),
        
        
        i&&(window.addEventListener("load",a),i.addEventListener("change",a))
    
    
    }();