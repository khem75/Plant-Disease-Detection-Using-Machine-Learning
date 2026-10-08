export function AboutView() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 py-2">
      <div>
        <h2 className="text-xl font-bold text-[#0F172A] tracking-tight">
          About Plant Health AI
        </h2>
        <p className="mt-1 text-xs text-[#64748B]">
          Accessible, explainable artificial intelligence for plant pathology screening.
        </p>
      </div>

      <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-2xs space-y-4 text-xs text-[#334155] leading-relaxed">
        <h3 className="text-sm font-bold text-[#0F172A]">Core Mission</h3>
        <p>
          Plant Health was created to help anyone—whether a home gardener, student, smallholder farmer, or agriculture professional—instantly inspect leaf photographs for common signs of crop disease without needing technical expertise in machine learning.
        </p>

        <h3 className="text-sm font-bold text-[#0F172A] pt-2">How It Works</h3>
        <p>
          Our neural network uses transfer learning with an <strong>EfficientNetB0</strong> backbone trained on the benchmark PlantVillage corpus covering 38 plant-pathogen classes. When an image is submitted, the model outputs normalized probability activations across all supported classes.
        </p>

        <h3 className="text-sm font-bold text-[#0F172A] pt-2">Explainable AI (Where the AI Looked)</h3>
        <p>
          To ensure transparency rather than a black-box answer, we implement <strong>Grad-CAM</strong> (Gradient-weighted Class Activation Mapping). By tracking gradient flows into the final convolutional layer (<code className="font-mono text-emerald-800">top_conv</code>), the system highlights image regions that contributed most strongly to the prediction.
        </p>

        <div className="rounded-xl border border-amber-200 bg-[#FFF7E6] p-4 text-[#92400E]">
          <h4 className="font-bold">Agricultural Advisory Notice</h4>
          <p className="mt-1 text-[11px] leading-relaxed">
            This tool is designed as an initial screening and educational aid. Lighting, camera lens quality, and conditions outside the training corpus can affect results. Never apply commercial chemical sprays or destroy crops without verification from a certified agronomist or extension pathologist.
          </p>
        </div>
      </div>
    </div>
  );
}
