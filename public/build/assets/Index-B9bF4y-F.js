import{u as A,r as m,j as t,H as C,b as P}from"./app-Cx-9cu95.js";import{A as D}from"./AuthenticatedLayout-BHy1-TWg.js";import{I as r}from"./Icons-DmkLuxXT.js";import{P as E}from"./Pagination-CCRLWaCr.js";import{S as h}from"./sweetalert2.esm.all-DE6NlnlT.js";import"./LocaleSwitcher-CdLa5QbK.js";import"./dialog-BeyYC933.js";import"./transition-DfumOU-K.js";function L({payments:n,filters:g}){const{flash:d,site_settings:i={}}=A().props,[u,f]=m.useState(g.search??""),[b,w]=m.useState(g.per_page??"10");m.useEffect(()=>{d?.success&&h.fire({toast:!0,position:"top-end",icon:"success",title:d.success,showConfirmButton:!1,timer:3e3,timerProgressBar:!0})},[d]);const c=(e={})=>{P.get(route("admin.fees.invoices"),{search:u,per_page:b,...e},{preserveState:!0,replace:!0})},v=e=>{const s=i.school_name||"School",x=[i.address,i.primary_phone&&`Phone: ${i.primary_phone}`].filter(Boolean).join(" | "),o=e.transaction_id||`RCPT-${e.id}`,a=e.student?.first_name+" "+(e.student?.last_name||""),p=e.student?.admission_no||"N/A",_=e.student?.class?.name||"N/A",k=e.student?.roll_no||"N/A",$=e.fee_assignment?.fee_group?.name||"General Fee",S=`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Money Receipt - ${o}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; margin: 0; padding: 0; }
          .receipt-container { max-width: 800px; margin: 20px auto; padding: 30px; border: 1px solid #ccc; background: #fff; }
          .header { text-align: center; border-bottom: 2px solid #2c3e50; padding-bottom: 15px; margin-bottom: 20px; }
          .school-logo { max-width: 90px; max-height: 70px; object-fit: contain; margin: 0 auto 8px; }
          .school-name { font-size: 26px; font-weight: bold; color: #2c3e50; margin: 0; text-transform: uppercase; }
          .school-address { font-size: 13px; color: #555; margin-top: 5px; }
          .receipt-title { display: inline-block; background: #2c3e50; color: #fff; padding: 6px 20px; font-weight: bold; border-radius: 4px; margin-top: 15px; letter-spacing: 1px; }
          .info-section { display: flex; justify-content: space-between; margin-bottom: 25px; font-size: 14px; }
          .info-box { width: 48%; }
          .info-table { width: 100%; }
          .info-table td { padding: 4px 0; }
          .info-table td:first-child { font-weight: bold; width: 120px; }
          .fee-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px; }
          .fee-table th, .fee-table td { border: 1px solid #ddd; padding: 10px 12px; }
          .fee-table th { background-color: #f8f9fa; text-align: left; font-weight: bold; color: #2c3e50; }
          .text-right { text-align: right !important; }
          .text-center { text-align: center !important; }
          .totals-wrapper { display: flex; justify-content: flex-end; margin-bottom: 40px; }
          .totals-table { width: 300px; border-collapse: collapse; font-size: 14px; }
          .totals-table td { padding: 6px 10px; border-bottom: 1px solid #eee; }
          .totals-table tr:last-child td { border-bottom: none; font-weight: bold; font-size: 16px; background-color: #f8f9fa; }
          .signatures { display: flex; justify-content: space-between; margin-top: 70px; }
          .signature-box { text-align: center; }
          .signature-line { border-top: 1px dashed #333; width: 180px; padding-top: 5px; font-size: 14px; font-weight: bold; }
          @media print { body { -webkit-print-color-adjust: exact; } .receipt-container { border: none; padding: 0; margin: 0; } }
        </style>
      </head>
      <body>
        <div class="receipt-container">
          <div class="header">
            ${i.logo?`<img class="school-logo" src="${i.logo}" alt="School logo">`:""}
            <h1 class="school-name">${s}</h1>
            <div class="school-address">${x}</div>
            <div class="receipt-title">MONEY RECEIPT</div>
          </div>
          <div class="info-section">
            <div class="info-box">
              <table class="info-table">
                <tr><td>Student Name</td><td>: ${a}</td></tr>
                <tr><td>Admission No</td><td>: ${p}</td></tr>
                <tr><td>Class & Roll</td><td>: ${_} (Roll: ${k})</td></tr>
              </table>
            </div>
            <div class="info-box">
              <table class="info-table">
                <tr><td>Receipt No</td><td>: ${o}</td></tr>
                <tr><td>Date</td><td>: ${e.payment_date}</td></tr>
                <tr><td>Method</td><td>: ${e.payment_method}</td></tr>
              </table>
            </div>
          </div>
          <table class="fee-table">
            <thead>
              <tr>
                <th width="10%" class="text-center">Sl</th>
                <th width="50%">Fee Description</th>
                <th width="20%" class="text-center">Month/Year</th>
                <th width="20%" class="text-right">Amount (৳)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="text-center">1</td>
                <td>${$}</td>
                <td class="text-center">${new Date(e.payment_date).toLocaleString("default",{month:"short",year:"numeric"})}</td>
                <td class="text-right">${Number(e.amount_paid).toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
          <div class="totals-wrapper">
            <table class="totals-table">
              <tr><td>Sub Total</td><td class="text-right">৳${Number(e.amount_paid).toFixed(2)}</td></tr>
              <tr><td>Discount / Fine</td><td class="text-right">৳0.00</td></tr>
              <tr><td><strong>Total Paid</strong></td><td class="text-right"><strong>৳${Number(e.amount_paid).toFixed(2)}</strong></td></tr>
            </table>
          </div>
          <div class="signatures">
            <div class="signature-box"><div class="signature-line">Student / Guardian</div></div>
            <div class="signature-box"><div class="signature-line">Authorized Signature</div></div>
          </div>
        </div>
      </body>
      </html>
    `,l=window.open("","_blank");l.document.write(S),l.document.close(),setTimeout(()=>{l.focus(),l.print()},250)},N=()=>window.print(),j=()=>{if(!n.data.length)return h.fire({icon:"warning",title:"No Data!",text:"Export করার মতো কোনো ডেটা নেই।"});const e=["Date","Student Name","Admission No","Fee Detail","Method","Amount"],s=n.data.map(a=>[a.payment_date||"N/A",`${a.student?.first_name||""} ${a.student?.last_name||""}`.trim()||"N/A",a.student?.admission_no||"N/A",a.fee_assignment?.fee_group?.name||"N/A",a.payment_method||"N/A",a.amount_paid||"0.00"]),x="data:text/csv;charset=utf-8,"+[e.join(","),...s.map(a=>a.map(p=>`"${p}"`).join(","))].join(`
`),o=document.createElement("a");o.setAttribute("href",encodeURI(x)),o.setAttribute("download",`Transactions_${new Date().toISOString().slice(0,10)}.csv`),document.body.appendChild(o),o.click(),document.body.removeChild(o)},y=()=>{if(!n.data.length)return;let e=`Date	Student Name	Admission No	Fee Detail	Method	Amount
`;n.data.forEach(s=>{e+=`${s.payment_date}	${s.student?.first_name||""} ${s.student?.last_name||""}	${s.student?.admission_no}	${s.fee_assignment?.fee_group?.name}	${s.payment_method}	${s.amount_paid}
`}),navigator.clipboard.writeText(e),h.fire({toast:!0,position:"top-end",icon:"success",title:"Data copied to clipboard!",showConfirmButton:!1,timer:2e3})};return t.jsxs(D,{children:[t.jsx(C,{title:"Invoices & Transactions"}),t.jsx("style",{dangerouslySetInnerHTML:{__html:`
        @media print {
          nav, aside, header, .no-print, button, a, select, input { display: none !important; }
          body, html { background: #f8fafc !important; }
          .print-table-wrapper { width: 100% !important; border: none !important; box-shadow: none !important; }
          .print-title { display: block !important; font-size: 24px !important; font-weight: bold !important; margin-bottom: 20px !important; }
        }
        @media screen { .print-title { display: none; } }
      `}}),t.jsxs("div",{className:"print-title",children:["Transactions Directory - ",new Date().toLocaleDateString("en-GB")]}),t.jsxs("div",{className:"w-full space-y-6 sm:px-6 lg:px-8 py-8 no-print",children:[t.jsx("div",{className:"flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4",children:t.jsxs("div",{children:[t.jsx("span",{className:"text-xs font-bold tracking-wider text-indigo-600 uppercase",children:"Finance & Accounts"}),t.jsx("h1",{className:"text-2xl font-bold text-slate-900 tracking-tight mt-1",children:"Invoices & Transactions"}),t.jsx("p",{className:"text-sm text-slate-500 mt-1",children:"সকল পেমেন্ট ও লেনদেনের তালিকা এবং মানি রিসিট।"})]})}),t.jsxs("div",{className:"bg-white p-3 rounded-2xl shadow-sm border border-slate-200 flex flex-col xl:flex-row items-center justify-between gap-4",children:[t.jsxs("div",{className:"flex flex-wrap items-center gap-3 w-full xl:w-auto",children:[t.jsxs("select",{value:b,onChange:e=>{w(e.target.value),c({per_page:e.target.value})},className:"appearance-none bg-none pr-3 py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer text-center font-mono",style:{backgroundImage:"none"},children:[t.jsx("option",{value:"10",children:"10 / Page"}),t.jsx("option",{value:"20",children:"20 / Page"}),t.jsx("option",{value:"50",children:"50 / Page"}),t.jsx("option",{value:"all",children:"All"})]}),t.jsx("div",{className:"hidden sm:block w-px h-6 bg-slate-200"}),t.jsxs("div",{className:"relative flex-1 min-w-[200px] sm:w-80",children:[t.jsx("div",{className:"absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none",children:t.jsx(r,{name:"search",className:"w-4 h-4 text-slate-400"})}),t.jsx("input",{type:"text",placeholder:"Search by Admission No or Name...",value:u,onChange:e=>f(e.target.value),onKeyDown:e=>e.key==="Enter"&&c(),className:"block w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"})]}),t.jsx("button",{onClick:()=>c(),className:"w-full sm:w-auto px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm",children:"Search"})]}),t.jsxs("div",{className:"flex items-center justify-end gap-1.5 bg-slate-50 border border-slate-200 p-1 rounded-xl w-full xl:w-auto shadow-sm shrink-0 ml-auto",children:[t.jsx("button",{onClick:y,className:"px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600 hover:bg-white hover:shadow-sm rounded-lg transition-all flex items-center gap-1.5",title:"Copy to Clipboard",children:"Copy"}),t.jsx("div",{className:"w-px h-4 bg-slate-200 mx-0.5"}),t.jsx("button",{onClick:j,className:"px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-600 hover:bg-white hover:shadow-sm rounded-lg transition-all flex items-center gap-1.5",title:"Export CSV",children:"CSV"}),t.jsx("div",{className:"w-px h-4 bg-slate-200 mx-0.5"}),t.jsx("button",{onClick:()=>alert("Backend Excel plugin needed"),className:"px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-green-600 hover:bg-white hover:shadow-sm rounded-lg transition-all flex items-center gap-1.5",title:"Export Excel",children:"Excel"}),t.jsx("div",{className:"w-px h-4 bg-slate-200 mx-0.5"}),t.jsx("button",{onClick:()=>alert("Backend PDF plugin needed"),className:"px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-white hover:shadow-sm rounded-lg transition-all flex items-center gap-1.5",title:"Export PDF",children:"PDF"}),t.jsx("div",{className:"w-px h-4 bg-slate-200 mx-0.5"}),t.jsx("button",{onClick:N,className:"px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-amber-600 hover:bg-white hover:shadow-sm rounded-lg transition-all flex items-center gap-1.5",title:"Print List",children:"Print"})]})]}),t.jsxs("div",{className:"bg-white rounded-2xl shadow-sm ring-1 ring-slate-900/5 print-table-wrapper",children:[t.jsx("div",{className:"overflow-x-auto",children:t.jsxs("table",{className:"w-full text-left border-collapse",children:[t.jsx("thead",{children:t.jsxs("tr",{className:"border-b border-slate-200 bg-slate-50/50",children:[t.jsx("th",{className:"px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider",children:"Date"}),t.jsx("th",{className:"px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider",children:"Student Info"}),t.jsx("th",{className:"px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider",children:"Fee Detail"}),t.jsx("th",{className:"px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider",children:"Method"}),t.jsx("th",{className:"px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider",children:"Amount"}),t.jsx("th",{className:"px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right no-print",children:"Action"})]})}),t.jsx("tbody",{className:"divide-y divide-slate-100",children:n.data.length===0?t.jsx("tr",{children:t.jsxs("td",{colSpan:6,className:"px-6 py-12 text-center text-slate-500",children:[t.jsx("div",{className:"w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-3 border border-slate-100",children:t.jsx(r,{name:"folder",className:"w-8 h-8 text-slate-300"})}),t.jsx("p",{className:"text-sm font-semibold text-slate-600",children:"No transactions found"}),t.jsx("p",{className:"text-xs text-slate-400 mt-1",children:"Try searching with a different keyword"})]})}):n.data.map(e=>t.jsxs("tr",{className:"hover:bg-slate-50/60 transition-colors",children:[t.jsx("td",{className:"px-6 py-4 text-sm font-semibold text-slate-700 font-mono",children:e.payment_date}),t.jsxs("td",{className:"px-6 py-4",children:[t.jsxs("span",{className:"text-sm font-bold text-slate-900 block",children:[e.student?.first_name," ",e.student?.last_name]}),t.jsxs("div",{className:"text-xs font-medium text-slate-500 mt-0.5 font-mono",children:["Adm: #",e.student?.admission_no]})]}),t.jsx("td",{className:"px-6 py-4",children:t.jsx("span",{className:"inline-flex px-2.5 py-1 bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-bold",children:e.fee_assignment?.fee_group?.name||"General Fee"})}),t.jsx("td",{className:"px-6 py-4",children:t.jsxs("span",{className:"inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 uppercase tracking-wide",children:[t.jsx(r,{name:"check",className:"w-3.5 h-3.5 text-indigo-500"}),e.payment_method]})}),t.jsx("td",{className:"px-6 py-4",children:t.jsxs("span",{className:"text-sm font-black text-emerald-600 font-mono",children:["৳",e.amount_paid]})}),t.jsx("td",{className:"px-6 py-4 text-right no-print",children:t.jsxs("button",{onClick:()=>v(e),className:"inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:text-indigo-600 rounded-lg transition-colors shadow-sm",title:"Print Receipt",children:[t.jsx(r,{name:"printer",className:"w-3.5 h-3.5"})," Print"]})})]},e.id))})]})}),t.jsx("div",{className:"no-print border-t border-slate-100 bg-white px-6 py-4 rounded-b-2xl",children:t.jsx(E,{meta:n})})]})]})]})}export{L as default};
