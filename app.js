const starterPosts=[
 {id:1,title:"Ek Adhuri Si Shaam",category:"Stories",date:"2026-08-17",body:"Kabhi kabhi ek shaam, poori kahani se zyada kuch keh jaati hai.\\n\\nYe tumhari pehli sample story hai. Is jagah tum apni original writing publish kar sakti ho.",likes:12,saved:false},
 {id:2,title:"Kuch Alfaaz Tumhare Naam",category:"Shayari",date:"2026-08-16",body:"Kuch baatein lafzon mein nahi, khamoshi mein achhi lagti hain.\\nAur kuch ehsaas, sirf mehsoos kiye jaate hain.",likes:8,saved:false},
 {id:3,title:"Aaj Ka Thought",category:"Quotes",date:"2026-08-15",body:"Har nayi subah ek naya page hai. Jo beet gaya, use kahani banao; jo aana hai, use khubsurat likho.",likes:21,saved:false}
];
let posts=JSON.parse(localStorage.getItem("ss_posts")||"null")||starterPosts;
let comments=JSON.parse(localStorage.getItem("ss_comments")||"[]");
let currentId=null, currentCategory="All";
const save=()=>{localStorage.setItem("ss_posts",JSON.stringify(posts));localStorage.setItem("ss_comments",JSON.stringify(comments))};

function renderPosts(){
 const q=(document.getElementById("search").value||"").toLowerCase();
 const list=posts.filter(p=>(currentCategory==="All"||p.category===currentCategory)&&(`${p.title} ${p.body} ${p.category}`.toLowerCase().includes(q))).sort((a,b)=>b.date.localeCompare(a.date)||b.id-a.id);
 document.getElementById("postGrid").innerHTML=list.map(p=>`
 <article class="post-card"><div><p class="eyebrow">${p.category}</p><h3>${esc(p.title)}</h3><p>${esc(p.body.slice(0,145))}${p.body.length>145?"…":""}</p><span class="date">${p.date}</span></div>
 <div class="card-actions"><button onclick="openReader(${p.id})">Read →</button><button onclick="likePost(${p.id})">♡ ${p.likes}</button><button onclick="savePost(${p.id})">🔖</button></div></article>`).join("")||"<p>No posts found.</p>";
}
function esc(s){return s.replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]))}
function filterCategory(c){currentCategory=c;renderPosts();document.getElementById("latest").scrollIntoView({behavior:"smooth"})}
function likePost(id){let p=posts.find(x=>x.id===id);p.likes++;save();renderPosts()}
function savePost(id){let p=posts.find(x=>x.id===id);p.saved=!p.saved;save();alert(p.saved?"Saved!":"Removed from saves.")}
function openReader(id){
 currentId=id;let p=posts.find(x=>x.id===id);
 readerCategory.textContent=p.category;readerTitle.textContent=p.title;readerDate.textContent=p.date;readerBody.textContent=p.body;
 likeBtn.querySelector("span").textContent=p.likes;renderComments();readerDialog.showModal();
}
function likeCurrent(){likePost(currentId);let p=posts.find(x=>x.id===currentId);likeBtn.querySelector("span").textContent=p.likes}
function saveCurrent(){savePost(currentId)}
async function shareCurrent(){let p=posts.find(x=>x.id===currentId);if(navigator.share)await navigator.share({title:p.title,text:p.body});else await navigator.clipboard.writeText(location.href+"#post-"+p.id).then(()=>alert("Link copied!"))}
function addComment(){
 const text=document.getElementById("commentText").value.trim();if(!text)return;
 comments.push({id:Date.now(),postId:currentId,text,status:"pending",user:"Reader"});document.getElementById("commentText").value="";save();renderComments();alert("Comment submitted for moderation.");
}
function renderComments(){
 const list=comments.filter(c=>c.postId===currentId&&c.status==="approved");
 document.getElementById("comments").innerHTML=list.length?list.map(c=>`<div class="mod-comment"><strong>${esc(c.user)}</strong><p>${esc(c.text)}</p></div>`).join(""):"<p class='hint'>No approved comments yet.</p>";
}
function openAdmin(){showAdminTab("posts");adminDialog.showModal()}
function showAdminTab(tab){document.getElementById("adminPosts").hidden=tab!=="posts";document.getElementById("adminComments").hidden=tab!=="comments";if(tab==="comments")renderModeration()}
function publishPost(){
 const title=newTitle.value.trim(),body=newBody.value.trim();if(!title||!body){alert("Title aur post dono fill karo.");return}
 posts.unshift({id:Date.now(),title,category:newCategory.value,date:new Date().toISOString().slice(0,10),body,likes:0,saved:false});save();newTitle.value="";newBody.value="";renderPosts();alert("Published! Post Latest Posts mein sabse upar aa gayi.");showAdminTab("posts")
}
function renderModeration(){
 const pending=comments.filter(c=>c.status==="pending");
 moderationList.innerHTML=pending.length?pending.map(c=>`<div class="mod-comment"><strong>${esc(c.user)}</strong><p>${esc(c.text)}</p><div class="mod-actions"><button class="approve" onclick="moderate(${c.id},'approved')">Approve</button><button class="delete" onclick="moderate(${c.id},'deleted')">Delete</button><button class="block" onclick="moderate(${c.id},'blocked')">Block user</button></div></div>`).join(""):"<p class='hint'>No pending comments.</p>";
}
function moderate(id,status){let c=comments.find(x=>x.id===id);c.status=status;save();renderModeration();renderComments()}
renderPosts();