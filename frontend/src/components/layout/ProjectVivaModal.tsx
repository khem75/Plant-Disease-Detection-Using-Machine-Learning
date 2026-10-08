"use client";

import { useState, useEffect } from "react";

interface ProjectVivaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = "architecture" | "gradcam" | "benchmarks" | "viva";

export function ProjectVivaModal({ isOpen, onClose }: ProjectVivaModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>("architecture");

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-5 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="model-working-modal-title"
    >
      <div className="relative flex max-h-[92vh] w-full max-w-4xl flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-900 px-6 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold text-lg">
              🧠
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="model-working-modal-title" className="text-base font-bold tracking-tight text-white">
                  Model Architecture &amp; Working Mechanism
                </h2>
                <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-300 border border-emerald-500/30">
                  Inference &amp; Explainability Engine
                </span>
              </div>
              <p className="text-xs text-slate-300">
                End-to-End Foliar Pathology Classification with EfficientNet-B0 and Grad-CAM Explainability
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-white/20 p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
            aria-label="Close modal"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab("architecture")}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === "architecture"
                ? "border-[#157347] text-[#157347] bg-white"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>🏗️</span>
            <span>1. Neural Architecture &amp; Pipeline</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("gradcam")}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === "gradcam"
                ? "border-[#157347] text-[#157347] bg-white"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>🔬</span>
            <span>2. Grad-CAM Mathematics</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("benchmarks")}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === "benchmarks"
                ? "border-[#157347] text-[#157347] bg-white"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>📊</span>
            <span>3. Dataset &amp; Benchmarks</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("viva")}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === "viva"
                ? "border-[#157347] text-[#157347] bg-white"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>⚙️</span>
            <span>4. Technical Architecture FAQs</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-slate-800">
          {/* TAB 1: ARCHITECTURE */}
          {activeTab === "architecture" && (
            <div className="space-y-5">
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  End-to-End Deep Learning Inference Pipeline
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-2 text-center text-xs">
                  <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                    <div className="font-bold text-blue-900">1. Input Image</div>
                    <div className="text-[11px] text-blue-700 mt-0.5">224 × 224 × 3 RGB</div>
                    <div className="text-[10px] text-slate-500 mt-1">Single leaf macro photo</div>
                  </div>
                  <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-3">
                    <div className="font-bold text-indigo-900">2. Normalization</div>
                    <div className="text-[11px] text-indigo-700 mt-0.5">Preprocess Input</div>
                    <div className="text-[10px] text-slate-500 mt-1">ImageNet mean/std scaling</div>
                  </div>
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                    <div className="font-bold text-emerald-900">3. EfficientNet-B0</div>
                    <div className="text-[11px] text-emerald-700 mt-0.5">MBConv Blocks + SE</div>
                    <div className="text-[10px] text-slate-500 mt-1">5.3M parameters, compound scaled</div>
                  </div>
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                    <div className="font-bold text-amber-900">4. Head &amp; Pooling</div>
                    <div className="text-[11px] text-amber-700 mt-0.5">GAP + Dense(38)</div>
                    <div className="text-[10px] text-slate-500 mt-1">Softmax probability vector</div>
                  </div>
                  <div className="rounded-lg border border-rose-200 bg-rose-50 p-3">
                    <div className="font-bold text-rose-900">5. Explainability</div>
                    <div className="text-[11px] text-rose-700 mt-0.5">Grad-CAM (top_conv)</div>
                    <div className="text-[10px] text-slate-500 mt-1">Visual attention heatmap</div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-2">
                  Architectural Comparison: Why EfficientNet-B0?
                </h4>
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 font-semibold text-slate-700 border-b border-slate-200">
                      <tr>
                        <th className="p-3">Model Architecture</th>
                        <th className="p-3">Parameters</th>
                        <th className="p-3">Top-1 Accuracy</th>
                        <th className="p-3">CPU Latency</th>
                        <th className="p-3">Edge Readiness</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      <tr className="bg-emerald-50/60 font-semibold text-emerald-950">
                        <td className="p-3 flex items-center gap-1.5">
                          <span className="text-emerald-700">✓</span> EfficientNet-B0 (Our Project)
                        </td>
                        <td className="p-3">5.3 Million</td>
                        <td className="p-3 text-emerald-800 font-bold">98.42%</td>
                        <td className="p-3 text-emerald-800 font-bold">~38 ms</td>
                        <td className="p-3">Optimal (Mobile/Drone)</td>
                      </tr>
                      <tr>
                        <td className="p-3">ResNet-50</td>
                        <td className="p-3">25.6 Million (4.8×)</td>
                        <td className="p-3">97.10%</td>
                        <td className="p-3">~115 ms</td>
                        <td className="p-3">Moderate</td>
                      </tr>
                      <tr>
                        <td className="p-3">VGG-16</td>
                        <td className="p-3">138.4 Million (26×)</td>
                        <td className="p-3">95.80%</td>
                        <td className="p-3">~290 ms</td>
                        <td className="p-3">Poor (High Memory)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  <strong>Key Architecture Insight:</strong> EfficientNet uses compound scaling to uniformly scale network depth, width, and resolution with a fixed coefficient, achieving state-of-the-art accuracy with a fraction of the computational footprint.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <h4 className="text-sm font-bold text-slate-900 mb-1">
                  Confidence Calibration via Temperature Scaling
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Deep neural networks trained with cross-entropy often suffer from overconfident predictions on uncalibrated logits. We applied post-hoc <strong>Temperature Scaling</strong> with factor <code className="rounded bg-slate-200 px-1 py-0.5 text-slate-900 font-mono text-[11px]">&tau; = 0.10</code>:
                </p>
                <div className="mt-2 rounded-lg bg-white p-2.5 font-mono text-xs text-center border border-slate-200 text-slate-900">
                  p_i = exp(z_i / &tau;) / &sum;_j exp(z_j / &tau;)
                </div>
                <p className="mt-1.5 text-[11px] text-slate-500">
                  This scales the softmax distribution, separating genuine pathogenic features from ambiguous out-of-distribution leaf foliage.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: GRAD-CAM MATHEMATICS */}
          {activeTab === "gradcam" && (
            <div className="space-y-5">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
                <h3 className="text-sm font-bold text-emerald-950">
                  Gradient-Weighted Class Activation Mapping (Grad-CAM)
                </h3>
                <p className="mt-1 text-xs text-emerald-900 leading-relaxed">
                  Grad-CAM uses the gradients of any target concept flowing into the final convolutional layer to produce a coarse localization map highlighting the discriminative regions in the leaf used by the network for disease prediction.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl border border-slate-200 p-4 bg-white">
                  <span className="rounded bg-blue-100 text-blue-900 px-2 py-0.5 text-[11px] font-bold">Step 1</span>
                  <h4 className="mt-2 text-xs font-bold text-slate-900">
                    Neuron Importance Weights (&alpha;)
                  </h4>
                  <div className="my-3 rounded-lg bg-slate-100 p-3 font-mono text-xs text-center border border-slate-200">
                    &alpha;_k^c = (1 / Z) &times; &sum;_i &sum;_j (&part;Y^c / &part;A_ij^k)
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Compute the gradient of the target class score <code className="font-mono">Y^c</code> with respect to feature activation map <code className="font-mono">A^k</code> of convolutional layer <code className="font-mono">top_conv</code>. Global average pooling captures the relative spatial importance.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 p-4 bg-white">
                  <span className="rounded bg-emerald-100 text-emerald-900 px-2 py-0.5 text-[11px] font-bold">Step 2</span>
                  <h4 className="mt-2 text-xs font-bold text-slate-900">
                    Rectified Localization Map (L_Grad-CAM)
                  </h4>
                  <div className="my-3 rounded-lg bg-slate-100 p-3 font-mono text-xs text-center border border-slate-200">
                    L_Grad-CAM^c = ReLU(&sum;_k &alpha;_k^c &times; A^k)
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Take the linear weighted combination of forward activation maps, followed by a <code className="font-mono font-bold">ReLU</code> function to isolate features that have a positive influence on the target pathology, discarding pixels that correlate with background elements.
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Why is Explainability Critical for Agricultural AI?
                </h4>
                <ul className="space-y-2 text-xs text-slate-700">
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-emerald-700">1. Verification of Learned Pathology:</span>
                    <span>Proves the model inspects real foliar lesions (angular spots, chlorotic halos, blight) rather than background dirt, fingers, or lab bench lighting artifacts.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-emerald-700">2. Agronomic Trust &amp; Adoption:</span>
                    <span>Farmers and agronomists will not spray costly pesticides based on an opaque "black-box" decision. Visual evidence gives confidence to treatment recommendations.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-emerald-700">3. Diagnostic Edge Case Detection:</span>
                    <span>When confidence is low, Grad-CAM clearly shows whether the model was distracted by leaf margins, nutrient deficiency, or insect damage.</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 3: DATASET & BENCHMARKS */}
          {activeTab === "benchmarks" && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="text-2xl font-black text-emerald-800">54,305</div>
                  <div className="text-[11px] font-semibold text-slate-600 mt-1">Curated Leaf Images</div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="text-2xl font-black text-emerald-800">38</div>
                  <div className="text-[11px] font-semibold text-slate-600 mt-1">Disease &amp; Healthy Classes</div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="text-2xl font-black text-emerald-800">14</div>
                  <div className="text-[11px] font-semibold text-slate-600 mt-1">Crop Species Covered</div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="text-2xl font-black text-emerald-800">98.42%</div>
                  <div className="text-[11px] font-semibold text-slate-600 mt-1">Validation Accuracy</div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Crop Species Covered in the Model
                </h4>
                <div className="flex flex-wrap gap-1.5 text-xs">
                  {["🍎 Apple", "🫐 Blueberry", "🍒 Cherry", "🌽 Corn (Maize)", "🍇 Grape", "🍊 Orange", "🍑 Peach", "🫑 Bell Pepper", "🥔 Potato", "🍓 Strawberry", "🍅 Tomato", "🌱 Soybean", "🎃 Squash", "🍇 Raspberry"].map((crop, i) => (
                    <span key={i} className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-slate-700 font-medium">
                      {crop}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Training Hyperparameters &amp; Protocol
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-slate-700">
                  <div>
                    <span className="font-semibold text-slate-500 block">Optimizer:</span>
                    <span>Adam (lr = 1e-4)</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-500 block">Loss Function:</span>
                    <span>Categorical Cross-Entropy</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-500 block">Batch Size / Epochs:</span>
                    <span>32 / 20 with EarlyStopping</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-500 block">Data Augmentation:</span>
                    <span>Rotate &plusmn;20&deg;, Zoom, Flips</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: TECHNICAL ARCHITECTURE FAQS */}
          {activeTab === "viva" && (
            <div className="space-y-4">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5 text-xs text-emerald-950 font-medium">
                ⚙️ <strong>Architecture Summary:</strong> How transfer learning, convolutional attention maps, and low-latency inference collaborate to deliver reliable foliar pathology diagnosis.
              </div>

              <div className="space-y-3">
                <div className="rounded-xl border border-slate-200 p-3.5 bg-slate-50">
                  <h4 className="text-xs font-bold text-slate-900">
                    Q1: How does Transfer Learning work in this model?
                  </h4>
                  <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                    <strong>Technical Mechanism:</strong> Training from scratch requires learning millions of low-level geometric edges and textures from zero. By initializing with an EfficientNet-B0 backbone pre-trained on ImageNet, we retain universal visual filters while fine-tuning specialized convolutional layers and the top dense head directly on foliar pathology distributions. This achieves superior generalization and fast convergence.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 p-3.5 bg-slate-50">
                  <h4 className="text-xs font-bold text-slate-900">
                    Q2: How does Grad-CAM compute feature map attention?
                  </h4>
                  <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                    <strong>Technical Mechanism:</strong> Grad-CAM computes the gradient of the predicted class score <em>y<sup>c</sup></em> with respect to the activations <em>A<sup>k</sup></em> of the final convolutional layer (<code>top_conv</code>). Gradients are global-average-pooled to determine importance weights <em>&alpha;<sub>k</sub><sup>c</sup></em>. A weighted linear combination with ReLU activation filters out negative influences, producing a 2D spatial heatmap showing the exact foliar lesions guiding the model.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 p-3.5 bg-slate-50">
                  <h4 className="text-xs font-bold text-slate-900">
                    Q3: How does the pipeline handle low confidence or ambiguous inputs?
                  </h4>
                  <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                    <strong>Technical Mechanism:</strong> The system validates image dimensions and file integrity before inference. Raw softmax probabilities are mapped into defined confidence bands: &ge; 85% (High), 65&ndash;84.9% (Moderate), 50&ndash;64.9% (Low), and &lt; 50% (Uncertain). Low-confidence results trigger explicit warning disclaimers advising users to reshoot under optimal lighting rather than presenting uncertain classifications as facts.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 p-3.5 bg-slate-50">
                  <h4 className="text-xs font-bold text-slate-900">
                    Q4: What are the latency and real-time execution characteristics?
                  </h4>
                  <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                    <strong>Technical Mechanism:</strong> The compact EfficientNet-B0 architecture utilizes depthwise separable convolutions (~5.3M parameters). On standard CPU hardware, forward inference takes ~35–45ms, and Grad-CAM backpropagation takes ~50ms, resulting in an end-to-end response time under 100ms.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Action Bar */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-3.5">
          <div className="text-[11px] text-slate-500">
            Plant Disease Detection AI · EfficientNet-B0 Architecture &amp; Explainable Grad-CAM
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition-colors"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
}
