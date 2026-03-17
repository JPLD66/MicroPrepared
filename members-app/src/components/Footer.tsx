export default function Footer() {
  return (
    <footer className="border-t border-gray-100 mt-8 no-print">
      <div className="max-w-3xl mx-auto px-4 py-6 text-center">
        <a href="/" className="inline-block mb-3">
          <img src="/dashboard/MicroPreparedLogo.svg" alt="MicroPrepared.com" className="h-[60px] mx-auto" />
        </a>
        <p className="mt-4 text-[10px] leading-relaxed text-gray-300 max-w-2xl mx-auto">
          Disclaimer: The information provided on this site is for general informational and educational purposes only and does not constitute medical, nutritional, dietary, or professional advice of any kind. Calorie estimates, shelf life figures, and pricing are approximate and may vary by product, region, and storage conditions. This tool is not a substitute for professional guidance from a qualified healthcare provider, nutritionist, or emergency preparedness expert. Always consult a medical professional before making changes to your diet, especially if you have allergies, health conditions, or specific dietary needs. The authors and operators of MicroPrepared.com make no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, or suitability of the information provided. In no event shall the authors or operators be liable for any loss, damage, or injury arising from the use of this information. Use at your own risk.
        </p>
      </div>
    </footer>
  );
}
