import { Head, Link } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

const img = (p) => (p ? `/storage/${p}` : null);

export default function PersonIdCard({
    personType,
    person,
    template,
    branding,
}) {
    const student = personType === "student",
        en = person.current_enrollment,
        labels = {
            id: "ID",
            class: "Class",
            roll: "Roll",
            blood: "Blood",
            dob: "Date of Birth",
            phone: "Phone",
            address: "Address",
            ...(template.field_labels || {}),
        },
        name = `${person.first_name} ${person.last_name || ""}`,
        identifier = student ? person.admission_no : person.staff_id_no,
        role = student
            ? `${en?.school_class?.name || "--"} · ${en?.section?.name || "--"}`
            : person.designation?.name || "Staff",
        logo = img(template.logo_image) || branding.logo,
        photo = img(person.photo);

    return (
        <AuthenticatedLayout>
            <Head title={`${name} ID Card`} />
            
            <style dangerouslySetInnerHTML={{__html: `
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
            `}} />

            <main className="mx-auto max-w-4xl p-6">
                <div className="no-print mb-5 flex justify-between">
                    <Link
                        href={
                            student
                                ? route("admin.students.index")
                                : route("admin.staff.index")
                        }
                        className="rounded-lg border px-4 py-2 hover:bg-slate-50"
                    >
                        Back
                    </Link>
                    <button
                        onClick={() => window.print()}
                        className="rounded-lg bg-indigo-600 px-5 py-2 text-white hover:bg-indigo-700 transition-colors"
                    >
                        Print ID Card
                    </button>
                </div>
                
                <div className="print-area">
                    <div
                        className={`mx-auto overflow-hidden rounded-2xl bg-white shadow-2xl ${template.layout_type === "Landscape" ? "h-[340px] w-[540px]" : "h-[540px] w-[340px]"}`}
                        style={{
                            backgroundImage: template.background_image
                                ? `url(${img(template.background_image)})`
                                : undefined,
                            backgroundSize: "cover",
                        }}
                    >
                        <header
                            className="flex items-center gap-3 p-5 text-white"
                            style={{ backgroundColor: template.theme_color }}
                        >
                            {logo && (
                                <img
                                    src={logo}
                                    className="h-12 w-12 object-contain"
                                />
                            )}
                            <div>
                                <h1 className="text-lg font-black" style={{color:'#EFBF04'}}>
                                    {person.campus?.name || branding.school_name}
                                </h1>
                                <p className="text-xs">{branding.school_tagline}</p>
                            </div>
                        </header>
                        <section
                            className={`flex h-[calc(100%-80px)] flex-col p-6 text-${template.text_align || "center"} items-${template.photo_align || "center"}`}
                        >
                            <div
                                className="mx-auto h-28 w-28 overflow-hidden rounded-xl border-4 bg-slate-100 shrink-0"
                                style={{ borderColor: template.theme_color }}
                            >
                                {photo ? (
                                    <img
                                        src={photo}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="grid h-full place-items-center text-4xl">
                                        👤
                                    </div>
                                )}
                            </div>
                            <h2 className="mt-4 text-2xl font-black truncate">{name}</h2>
                            <p
                                className="font-bold truncate"
                                style={{ color: template.theme_color }}
                            >
                                {role}
                            </p>
                            <div className="mt-5 w-full space-y-1.5 text-sm flex-1">
                                <p>
                                    <b>{labels.id}:</b> {identifier}
                                </p>
                                {student && (
                                    <p>
                                        <b>{labels.roll}:</b> {en?.roll_no || "--"}
                                    </p>
                                )}
                                {template.show_blood_group && (
                                    <p>
                                        <b>{labels.blood}:</b>{" "}
                                        {person.blood_group || "--"}
                                    </p>
                                )}
                                {template.show_phone && (
                                    <p>
                                        <b>{labels.phone}:</b>{" "}
                                        {person.phone || "--"}
                                    </p>
                                )}
                                {template.show_address && (
                                    <p className="truncate">
                                        <b>{labels.address}:</b>{" "}
                                        {person.present_address || "--"}
                                    </p>
                                )}
                            </div>
                            <div className="mt-auto shrink-0">
                                {template.signature_image && (
                                    <img
                                        src={img(template.signature_image)}
                                        className="mx-auto h-8 mb-1"
                                    />
                                )}
                                <div className="border-t border-slate-300 pt-1 px-8 text-xs font-semibold text-slate-600">
                                    Authorized Signature
                                </div>
                            </div>
                        </section>
                    </div>

                    <div className="mx-auto mt-5 max-w-lg rounded-xl border border-slate-300 bg-white p-5 text-center break-inside-avoid">
                        <b className="text-lg">{identifier}</b>
                        <p className="mt-2 text-sm text-slate-600 font-medium">
                            {template.back_side_content}
                        </p>
                        <p className="mt-3 text-xs text-slate-500 font-medium">
                            {person.campus?.address || branding.address} ·{" "}
                            {person.campus?.phone || branding.primary_phone}
                        </p>
                    </div>
                </div>
            </main>
        </AuthenticatedLayout>
    );
}