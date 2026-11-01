// colisao.js — colisão simples no plano XZ.

// (x, z) está dentro da caixa girada? `folga` aumenta a caixa nos quatro lados.
// caixa: { x, z, giro, meiaLargura, meiaProfundidade }
export function dentroDaCaixa(x, z, caixa, folga = 0) {
  const { lx, lz } = paraLocal(x, z, caixa);
  return Math.abs(lx) < caixa.meiaLargura + folga && Math.abs(lz) < caixa.meiaProfundidade + folga;
}

function paraLocal(x, z, caixa) {
  const dx = x - caixa.x;
  const dz = z - caixa.z;
  const c = Math.cos(caixa.giro);
  const s = Math.sin(caixa.giro);
  return { lx: dx * c - dz * s, lz: dx * s + dz * c };
}

// Se `corpo` entrou na caixa, empurra pro lado mais próximo (desliza encostado na parede).
export function empurrarDeCaixa(corpo, caixa, folga) {
  const { lx, lz } = paraLocal(corpo.x, corpo.z, caixa);
  const sobraX = caixa.meiaLargura + folga - Math.abs(lx);
  const sobraZ = caixa.meiaProfundidade + folga - Math.abs(lz);
  if (sobraX <= 0 || sobraZ <= 0) return;

  const novoX = sobraX < sobraZ ? Math.sign(lx || 1) * (caixa.meiaLargura + folga) : lx;
  const novoZ = sobraX < sobraZ ? lz : Math.sign(lz || 1) * (caixa.meiaProfundidade + folga);
  const c = Math.cos(caixa.giro);
  const s = Math.sin(caixa.giro);
  corpo.x = caixa.x + novoX * c + novoZ * s;
  corpo.z = caixa.z - novoX * s + novoZ * c;
}

// Se `corpo` ({x, z}) entrou no círculo, empurra pra borda dele.
export function empurrarDeCirculo(corpo, cx, cz, raio) {
  const dx = corpo.x - cx;
  const dz = corpo.z - cz;
  const d = Math.hypot(dx, dz);
  if (d >= raio) return;
  if (d === 0) {
    corpo.z = cz + raio;
    return;
  }
  corpo.x = cx + (dx / d) * raio;
  corpo.z = cz + (dz / d) * raio;
}
