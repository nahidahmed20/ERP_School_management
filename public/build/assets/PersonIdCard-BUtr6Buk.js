import{j as e,H as u,L as j}from"./app-Cx-9cu95.js";import{A as b}from"./AuthenticatedLayout-BHy1-TWg.js";import"./Icons-DmkLuxXT.js";import"./LocaleSwitcher-CdLa5QbK.js";import"./dialog-BeyYC933.js";import"./transition-DfumOU-K.js";const r=l=>l?`/storage/${l}`:null;function v({personType:l,person:t,template:s,branding:a}){const o=l==="student",n=t.current_enrollment,i={id:"ID",roll:"Roll",blood:"Blood",phone:"Phone",address:"Address",...s.field_labels||{}},d=`${t.first_name} ${t.last_name||""}`,c=o?t.admission_no:t.staff_id_no,h=o?`${n?.school_class?.name||"--"} · ${n?.section?.name||"--"}`:t.designation?.name||"Staff",x=r(s.logo_image)||a.logo,m=r(t.photo);return e.jsxs(b,{children:[e.jsx(u,{title:`${d} ID Card`}),e.jsx("style",{dangerouslySetInnerHTML:{__html:`
                @media print {
                    /* সাইডবার, হেডার এবং নো-প্রিন্ট ক্লাসগুলো হাইড করা */
                    body * {
                        visibility: hidden;
                    }
                    /* শুধুমাত্র আইডি কার্ডের এরিয়া দৃশ্যমান করা */
                    .print-area, .print-area * {
                        visibility: visible;
                    }
                    /* আইডি কার্ডকে পেজের একদম উপরে নিয়ে আসা */
                    .print-area {
                        position: absolute;
                        left: 0;
                        top: 0;
                        margin: 0 !important;
                        padding: 0 !important;
                    }
                    /* ব্যাকগ্রাউন্ড কালার যেন প্রিন্ট হয় তার ব্যবস্থা */
                    * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    .no-print {
                        display: none !important;
                    }
                }
            `}}),e.jsxs("main",{className:"mx-auto max-w-4xl p-6",children:[e.jsxs("div",{className:"no-print mb-5 flex justify-between",children:[e.jsx(j,{href:o?route("admin.students.index"):route("admin.staff.index"),className:"rounded-lg border px-4 py-2 hover:bg-slate-50",children:"Back"}),e.jsx("button",{onClick:()=>window.print(),className:"rounded-lg bg-indigo-600 px-5 py-2 text-white hover:bg-indigo-700 transition-colors",children:"Print ID Card"})]}),e.jsxs("div",{className:"print-area",children:[e.jsxs("div",{className:`mx-auto overflow-hidden rounded-2xl bg-white shadow-2xl ${s.layout_type==="Landscape"?"h-[340px] w-[540px]":"h-[540px] w-[340px]"}`,style:{backgroundImage:s.background_image?`url(${r(s.background_image)})`:void 0,backgroundSize:"cover"},children:[e.jsxs("header",{className:"flex items-center gap-3 p-5 text-white",style:{backgroundColor:s.theme_color},children:[x&&e.jsx("img",{src:x,className:"h-12 w-12 object-contain"}),e.jsxs("div",{children:[e.jsx("h1",{className:"text-lg font-black",style:{color:"#EFBF04"},children:t.campus?.name||a.school_name}),e.jsx("p",{className:"text-xs",children:a.school_tagline})]})]}),e.jsxs("section",{className:`flex h-[calc(100%-80px)] flex-col p-6 text-${s.text_align||"center"} items-${s.photo_align||"center"}`,children:[e.jsx("div",{className:"mx-auto h-28 w-28 overflow-hidden rounded-xl border-4 bg-slate-100 shrink-0",style:{borderColor:s.theme_color},children:m?e.jsx("img",{src:m,className:"h-full w-full object-cover"}):e.jsx("div",{className:"grid h-full place-items-center text-4xl",children:"👤"})}),e.jsx("h2",{className:"mt-4 text-2xl font-black truncate",children:d}),e.jsx("p",{className:"font-bold truncate",style:{color:s.theme_color},children:h}),e.jsxs("div",{className:"mt-5 w-full space-y-1.5 text-sm flex-1",children:[e.jsxs("p",{children:[e.jsxs("b",{children:[i.id,":"]})," ",c]}),o&&e.jsxs("p",{children:[e.jsxs("b",{children:[i.roll,":"]})," ",n?.roll_no||"--"]}),s.show_blood_group&&e.jsxs("p",{children:[e.jsxs("b",{children:[i.blood,":"]})," ",t.blood_group||"--"]}),s.show_phone&&e.jsxs("p",{children:[e.jsxs("b",{children:[i.phone,":"]})," ",t.phone||"--"]}),s.show_address&&e.jsxs("p",{className:"truncate",children:[e.jsxs("b",{children:[i.address,":"]})," ",t.present_address||"--"]})]}),e.jsxs("div",{className:"mt-auto shrink-0",children:[s.signature_image&&e.jsx("img",{src:r(s.signature_image),className:"mx-auto h-8 mb-1"}),e.jsx("div",{className:"border-t border-slate-300 pt-1 px-8 text-xs font-semibold text-slate-600",children:"Authorized Signature"})]})]})]}),e.jsxs("div",{className:"mx-auto mt-5 max-w-lg rounded-xl border border-slate-300 bg-white p-5 text-center break-inside-avoid",children:[e.jsx("b",{className:"text-lg",children:c}),e.jsx("p",{className:"mt-2 text-sm text-slate-600 font-medium",children:s.back_side_content}),e.jsxs("p",{className:"mt-3 text-xs text-slate-500 font-medium",children:[t.campus?.address||a.address," ·"," ",t.campus?.phone||a.primary_phone]})]})]})]})]})}export{v as default};
