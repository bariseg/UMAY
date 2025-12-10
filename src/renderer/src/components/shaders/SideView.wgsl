struct Uniforms {
  altitudeRatio : f32, // 0.0 - 1.0 arası normalizasyon
};

@group(0) @binding(0) var<uniform> uniforms : Uniforms;

struct VertexOutput {
  @builtin(position) Position : vec4<f32>,
  @location(0) color : vec4<f32>,
};

@vertex
fn vs_main(@builtin(vertex_index) vertexIndex : u32) -> VertexOutput {
  var output : VertexOutput;
  
  // --- AYARLAR ---
  let axisX = -0.95;      // Dikey çizginin X konumu (Solda)
  let groundY = -0.95;    // Zemin çizgisinin Y konumu (Altta)
  let topY = 0.9;        // Grafiğin tepe noktası
  
  // Hareket Alanı: Zemin ile Tepe arası
  let drawingHeight = topY - groundY; 
  
  // Uçağın anlık Y konumu: Zemin + (Oran * Yükseklik)
  let planeY = groundY + (uniforms.altitudeRatio * drawingHeight);

  var pos = vec2<f32>(0.0, 0.0);
  var color = vec4<f32>(1.0, 1.0, 1.0, 1.0); // Varsayılan Beyaz

  // --- ÇİZİM MANTIĞI ---
  
  // 0-1: Dikey Eksen Çizgisi (Solda sabit)
  if (vertexIndex == 0u) { pos = vec2<f32>(axisX, groundY); color = vec4<f32>(0.5, 0.5, 1.5, 1.0); }
  else if (vertexIndex == 1u) { pos = vec2<f32>(axisX, topY); color = vec4<f32>(1.0, 0.5, 0.5, 1.0); }
  
  // 2-3: Zemin Çizgisi (Altta sabit)
  else if (vertexIndex == 2u) { pos = vec2<f32>(axisX, groundY); color = vec4<f32>(0.5, 0.5, 0.5, 1.0); } // Başlangıç
  else if (vertexIndex == 3u) { pos = vec2<f32>(0.9, groundY);   color = vec4<f32>(0.5, 0.5, 0.5, 1.0); } // Bitiş (Sağa kadar)

  // 4-6: Uçak Simgesi (Hareketli Üçgen)
  // Uçak dikey çizginin üzerinde yukarı aşağı kayar
  else if (vertexIndex == 4u) { 
      // Burun (Sağa bakıyor)
    pos = vec2<f32>(axisX + 0.1, planeY); 
      color = vec4<f32>(0.0, 1.0, 0.0, 1.0); // Yeşil Uçak
  } 
  else if (vertexIndex == 5u) { 
      // Kuyruk Üst
      pos = vec2<f32>(axisX - 0.02, planeY + 0.04); 
      color = vec4<f32>(0.0, 0.8, 0.0, 1.0); 
  }
  else if (vertexIndex == 6u) { 
      // Kuyruk Alt
      pos = vec2<f32>(axisX - 0.02, planeY - 0.04); 
      color = vec4<f32>(0.0, 0.8, 0.0, 1.0); 
  }

  output.Position = vec4<f32>(pos, 0.0, 1.0);
  output.color = color;
  return output;
}

@fragment
fn fs_main(@location(0) color : vec4<f32>) -> @location(0) vec4<f32> {
  return color;
}