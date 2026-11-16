<?php
$file = "resources/js/Pages/Auth/Login.jsx";
$content = file_get_contents($file);

// Add isMainDomain to props
$content = str_replace(
    "export default function Login({ status, canResetPassword, captchaQuestion })", 
    "export default function Login({ status, canResetPassword, captchaQuestion, isMainDomain })", 
    $content
);

// Add register link block before 'Need help signing in?'
$searchBlock = '<div className="mt-6 sm:mt-8 text-center text-xs sm:text-sm text-[#6B7568]">
                            Need help signing in?';

$replaceBlock = '{isMainDomain && (
                            <div className="mt-5 text-center text-sm font-semibold">
                                <span className="text-gray-600">Want to create your school portal? </span>
                                <Link href={route(\'register\')} className="font-bold hover:underline" style={{ color: \'var(--accent)\' }}>
                                    Register Here
                                </Link>
                            </div>
                        )}
                        <div className="mt-6 sm:mt-8 text-center text-xs sm:text-sm text-gray-500">
                            Need help signing in?';

$content = str_replace($searchBlock, $replaceBlock, $content);

// Fix text colors for better contrast
$content = str_replace("text-[#3C443E]", "text-gray-800", $content);
$content = str_replace("text-[#16241D]", "text-gray-900 font-medium", $content);
$content = str_replace("text-[#6B7568]", "text-gray-600", $content);
$content = str_replace("text-[#2E3531]", "text-gray-900 font-semibold", $content);
$content = str_replace("bg-[#FAF9F5]", "bg-white", $content); // Change yellowish bg to pure white for inputs
$content = str_replace("border-[#E4E0D4]", "border-gray-300", $content);

file_put_contents($file, $content);
echo "Login patched successfully";
