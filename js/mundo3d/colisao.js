// colisao.js — colisão simples no plano XZ.

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
