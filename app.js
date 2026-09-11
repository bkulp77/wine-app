/* =====================================================================
   PRE-PACKAGED OFFLINE DATABASE TOOLS (DO NOT EDIT THIS UPPER PORTION)
   ===================================================================== */
(function(g,f){typeof exports==='object'&&typeof module!=='undefined'?f(exports):typeof define==='function'&&define.amd?define(['exports'],f):(g=typeof globalThis!=='undefined'?globalThis:g||self,f(g.supabase={}))})(this,(function(exports){'use strict';var __defProp=Object.defineProperty;var __getOwnPropSymbols=Object.getOwnPropertySymbols;var __hasOwnProp=Object.prototype.hasOwnProperty;var __propIsEnum=Object.prototype.propertyIsEnumerable;var __defNormalProp=(obj,key,value)=>key in obj?__defProp(obj,key,{enumerable:true,configurable:true,writable:true,value}):obj[key]=value;var __spreadValues=(a,b)=>{for(var prop in b||(b={}))if(__hasOwnProp.call(b,prop))__defNormalProp(a,prop,b[prop]);if(__getOwnPropSymbols)for(var prop of __getOwnPropSymbols(b)){if(__propIsEnum.call(b,prop))__defNormalProp(a,prop,b[prop]);}return a;};class SupabaseClient{constructor(supabaseUrl,supabaseKey,options){this.supabaseUrl=supabaseUrl;this.supabaseKey=supabaseKey;const settings=__spreadValues({auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}},options);this.auth=null;this.realtime=null;}from(table){const url=`${this.supabaseUrl}/rest/v1/${table}`;return{select:(columns='*')=>this._request('GET',url,null,columns),insert:(values)=>this._request('POST',url,values),update:(values)=>this._request('PATCH',url,values),delete:()=>this._request('DELETE',url,null)};}_request(method,url,body=null,columns=null){let targetUrl=url;if(columns)targetUrl+=`?select=${encodeURIComponent(columns)}`;if(method==='PATCH'||method==='DELETE'){const idSearch=body&&body.id?`id=eq.${body.id}`:'';if(idSearch)targetUrl+=`?${idSearch}`;}const headers={'apikey':this.supabaseKey,'Authorization':`Bearer ${this.supabaseKey}`,'Content-Type':'application/json','Prefer':'return=representation'};if(method==='PATCH'&&body){delete body.id;}const fetchOptions={method,headers};if(body&&method!=='GET')fetchOptions.body=JSON.stringify(body);return fetch(targetUrl,fetchOptions).then(res=>{if(!res.ok)return res.json().then(err=>({data:null,error:err}));if(res.status===204)return{data:[],error:null};return res.json().then(data=>({data,error:null}));}).catch(err=>({data:null,error:{message:err.message}}));}}function createClient(supabaseUrl,supabaseKey,options){return new SupabaseClient(supabaseUrl,supabaseKey,options)}exports.createClient=createClient;Object.defineProperty(exports,'__esModule',{value:true});})); 

/* =====================================================================
   YOUR CUSTOM INVENTORY CODE (CONFIGURED TO USE OFFLINE TOOLS)
   ===================================================================== */
const supabaseUrl = 'https://nlgwoafmcxzcjknkbmtd.supabase.co'; 
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5sZ3dvYWZtY3h6Y2prbmtibXRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkwNzY3MzcsImV4cCI6MjEwNDY1MjczN30.azfPDyKXzVVc0YVpV7vbmwhlz6U7AfLvM8surXfVQJI'; 
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey); 

const tableBody = document.getElementById('table-body'); 
const searchBox = document.getElementById('search-box'); 
let inventoryData = []; 

// Load inventory records straight from your live remote table 
async function loadInventory() { 
    try { 
        console.log("Attempting secure connection to Supabase..."); 
        const { data, error } = await supabase
  .from('inventory.csv')
  .select('*', { 
    headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' } 
  });
        if (error) { 
            console.error("Supabase Error Details:", error); 
            throw new Error(`[${error.code || 'API Error'}] ${error.message}`); 
        } 

        // Sort data locally by Winery Name, then Wine Name (with string conversion safety for numeric codes like '250') 
        if (data && data.length > 0) { 
            data.sort((rowA, rowB) => { 
                const wineryA = String(rowA.winery || '').trim().toLowerCase(); 
                const wineryB = String(rowB.winery || '').trim().toLowerCase(); 
                if (wineryA < wineryB) return -1; 
                if (wineryA > wineryB) return 1; 
                const wineA = String(rowA.wine_name || '').trim().toLowerCase(); 
                const wineB = String(rowB.wine_name || '').trim().toLowerCase(); 
                if (wineA < wineB) return -1; 
                if (wineA > wineB) return 1; 
                return 0; 
            }); 
        } 

        console.log("Data successfully retrieved:", data); 
        inventoryData = data; 
        renderTable(inventoryData); 
    } catch (error) { 
        console.error("Critical Failure inside loadInventory:", error); 
        tableBody.innerHTML = `<tr><td colspan="9" style="color:red; font-weight:bold; padding: 20px; background: #fff1f1;">⚠️ Connection Failed:<br><small>${error.message}</small></td></tr>`; 
    } 
} 

function renderTable(rows) { 
    tableBody.innerHTML = ''; 
    if (!rows || rows.length === 0) { 
        tableBody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding:20px; color:#666;">Your database table is connected but empty.</td></tr>`; 
        return; 
    } 
    rows.forEach((row) => { 
        try { 
            const tr = document.createElement('tr'); 
            const id = row.id; 
            const winery = row.winery || 'N/A'; 
            const state = row.state || 'N/A'; 
            const wineName = row.wine_name || 'N/A'; 
            const vintage = row.vintage || 'N/A'; 
            const type = row.type || 'N/A'; 
            let quantity = parseInt(row.quantity) || 0; 
            const binLocation = row.bin_location || 'N/A'; 
            const imagePath = row.image ? String(row.image).trim() : ''; 
            const website = row.website || 'N/A'; 
            const lowStockClass = quantity <= 1 ? '' : 'display: none;'; 
            const imageHtml = imagePath ? `<img src="${imagePath}" class="wine-pic" alt="${wineName}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">` : ''; 
            const fallbackHtml = `<div class="wine-pic" style="${imagePath ? 'display:none;' : 'display:flex;'}">🍷</div>`; 

            tr.innerHTML = ` 
                <td> 
                    <div class="img-cell-wrapper"> 
                        ${imageHtml} 
                        ${fallbackHtml} 
                    </div> 
                </td> 
                <td><strong>${winery}</strong></td> 
                <td>${state}</td> 
                <td>${wineName}</td> 
                <td>${vintage}</td> 
                <td>${type}</td> 
                <td> 
                    <div class="qty-controls"> 
                        <button class="btn-qty btn-minus">−</button> 
                        <span class="qty-val">${quantity}</span> 
                        <button class="btn-qty btn-plus">+</button> 
                        <span class="low-stock" style="${lowStockClass}">Low</span> 
                    </div> 
                </td> 
                <td><code>${binLocation}</code></td> 
                <td><a href="https://${website}" target="_blank"><code>${website}</code></a></td> 
            `; 

            const qtyValEl = tr.querySelector('.qty-val'); 
            const lowStockEl = tr.querySelector('.low-stock'); 

           // Corrected button event listeners
tr.querySelector('.btn-minus').addEventListener('click', async () => {
  if (quantity > 0) {
    quantity--;
    // PASS ONLY THE VALUE TO UPDATE, THE ID STAYS SEPARATE TO PASS SAFELY
    const { error } = await supabase
      .from('inventory.csv')
      .update({ id: id, quantity: quantity }); 
      
    if (!error) {
      row.quantity = quantity;
      qtyValEl.textContent = quantity;
      lowStockEl.style.display = quantity <= 1 ? 'inline' : 'none';
    } else {
      alert("Failed to update: " + error.message);
    }
  }
});

tr.querySelector('.btn-plus').addEventListener('click', async () => {
  quantity++;
  const { error } = await supabase
    .from('inventory.csv')
    .update({ id: id, quantity: quantity });
    
  if (!error) {
    row.quantity = quantity;
    qtyValEl.textContent = quantity;
    lowStockEl.style.display = quantity <= 1 ? 'inline' : 'none';
  } else {
    alert("Failed to update: " + error.message);
  }
});


            tableBody.appendChild(tr); 
        } catch (rowError) { 
            console.error("Error rendering a row item:", rowError, row); 
        } 
    }); 
} 

// Live real-time text input search filtering loop
searchBox.addEventListener('input', function(e) { 
    const searchFilter = e.target.value.toLowerCase(); 
    const filteredRows = inventoryData.filter(row => { 
        const winery = String(row.winery || '').toLowerCase(); 
        const wineName = String(row.wine_name || '').toLowerCase(); 
        const binLocation = String(row.bin_location || '').toLowerCase(); 
        const type = String(row.type || '').toLowerCase(); 
        
        return winery.includes(searchFilter) || 
               wineName.includes(searchFilter) || 
               type.includes(searchFilter) || 
               binLocation.includes(searchFilter); 
    }); 
    renderTable(filteredRows); 
}); 

// Automatically runs baseline query operation on layout compilation
loadInventory();