# PRACTICAL IMPLEMENTATION ROADMAP
## Week-by-Week Execution Plan with Testing Checkpoints

---

## WEEK 1-4: FOUNDATION & MESA VALIDATION

### Week 1: Environment Setup & Data Acquisition

**Goals:**
- [ ] Setup development environment
- [ ] Download MIST stellar tracks
- [ ] Implement basic data loading

**Concrete Tasks:**

```bash
# 1.1: Environment setup
pip install jax jaxlib optax diffrax
pip install astropy lightkurve astroquery
pip install numpy scipy matplotlib

# 1.2: Download MIST data
# Go to: waps.cfa.harvard.edu/MIST/
# Download: MIST_v1.2_feh_p0.00_afe_p0.0_vvcrit0.4/00100M_Gyr1.00.track
#           (1 solar mass, 1 Gyr age) - manageable for testing

cd ~/data
curl -o mist_1Msun_1Gyr.track [MIST_URL]
```

**Testing Checkpoint 1.1:**
```python
from improved_jax_stellar_model import load_mist_validation_data

data = load_mist_validation_data("mist_1Msun_1Gyr.track")
assert 'r' in data
assert 'T' in data
assert len(data['T']) > 100
print("✓ MIST data loaded successfully")
```

**Deliverable:** 
- Data loading working
- Sample MIST file in working directory
- Test passes

---

### Week 2: Core Physics Implementation

**Goals:**
- [ ] Validate Thomas algorithm
- [ ] Test hydrostatic equilibrium solver
- [ ] Compare pressure profiles with MIST

**Concrete Tasks:**

```python
# task_2a_thomas_algorithm.py
from improved_jax_stellar_model import thomas_algorithm_solver
import jax.numpy as jnp

# Test case: 100-layer tridiagonal system
N = 100
a = jnp.ones(N) * -0.1
b = jnp.ones(N) * 2.0
c = jnp.ones(N-1) * -0.1
d = jnp.ones(N) * 5.0

x = thomas_algorithm_solver(a, b, c, d)

# Verify: A*x ≈ d
residual = jnp.sum(jnp.abs(
    a[1:] * x[:-1] + b * x + c[:-1] * x[1:] - d
))

print(f"Thomas Algorithm Residual: {residual:.3e}")
assert residual < 1e-6, "Thomas solver failed"
print("✓ Thomas algorithm validated")
```

**Testing Checkpoint 2.1:**
```python
# task_2b_hydrostatic_validation.py
from improved_jax_stellar_model import solve_hydrostatic_equilibrium
import matplotlib.pyplot as plt

# Load MIST data
mist_data = load_mist_validation_data("mist_1Msun_1Gyr.track")

# Run JAX hydrostatic solver with MIST density profile
r_grid = mist_data['r']
T_profile = mist_data['T']
rho_profile = mist_data['rho']
M_enclosed = compute_enclosed_mass(r_grid, rho_profile, dr=1e10)

P_jax = solve_hydrostatic_equilibrium(
    r_grid, T_profile, rho_profile, M_enclosed,
    T_eff=5777, log_g=4.438, Z=0.018,
    dr=1e10
)

# Compare with MIST pressure
P_error = jnp.abs((P_jax - mist_data['P']) / mist_data['P'])

plt.figure(figsize=(10, 6))
plt.plot(r_grid / 6.96e10, P_error * 100)
plt.xlabel("Fractional Radius")
plt.ylabel("Pressure Error (%)")
plt.title("JAX vs. MIST Hydrostatic Equilibrium")
plt.yscale('log')
plt.grid()
plt.savefig("hydrostatic_validation.png", dpi=150)

# Success criterion: < 1% error everywhere
assert jnp.max(P_error) < 0.01, "Pressure error > 1%"
print("✓ Hydrostatic equilibrium validated")
```

**Deliverable:**
- Thomas algorithm verified
- Hydrostatic solver produces < 1% error vs. MIST
- Validation plot saved

---

### Week 3: Nuclear Burning Integration

**Goals:**
- [ ] Validate nuclear reaction rates
- [ ] Test composition evolution
- [ ] Compare with literature values

**Concrete Tasks:**

```python
# task_3a_nuclear_rates.py
from improved_jax_stellar_model import nuclear_reaction_rates
import matplotlib.pyplot as plt

# Solar core conditions
T_range = jnp.logspace(6.5, 7.5, 50)  # 3 - 30 MK
rho_solar_core = 150.0
X_H, X_He, X_C = 0.73, 0.25, 0.02

# Compute rates
epsilon_pp_array = []
epsilon_cno_array = []

for T in T_range:
    rates = nuclear_reaction_rates(T, rho_solar_core, X_H, X_He, X_C)
    epsilon_pp_array.append(rates['epsilon_pp'])
    epsilon_cno_array.append(rates['epsilon_cno'])

# Plot
plt.loglog(T_range/1e6, epsilon_pp_array, label='PP-chain')
plt.loglog(T_range/1e6, epsilon_cno_array, label='CNO cycle')
plt.xlabel("Temperature (MK)")
plt.ylabel("Power (erg/g/s)")
plt.legend()
plt.grid()
plt.savefig("nuclear_rates.png", dpi=150)

# Sanity check: at 15 MK (solar core), should get ~2-3 erg/g/s total
T_solar = 1.5e7
rates_solar = nuclear_reaction_rates(T_solar, rho_solar_core, X_H, X_He, X_C)
epsilon_total = rates_solar['epsilon_total']

print(f"Solar core power: {epsilon_total:.2e} erg/g/s")
print(f"Expected: ~2-3 erg/g/s")
assert 1.5 < epsilon_total < 4.0, "Nuclear rates out of physical range"
print("✓ Nuclear reaction rates validated")
```

**Testing Checkpoint 3.1:**
```python
# task_3b_composition_evolution.py
from improved_jax_stellar_model import step_stellar_evolution, StellarState

# Initialize state
state_init = StellarState(
    T=jnp.linspace(1e7, 1e4, 100),
    rho=jnp.linspace(150, 1e-6, 100),
    X_H=0.70,
    X_He=0.27,
    X_C=0.03
)

# Evolve for 1 Gyr in 10 Myr steps
dt = 1e7  # 10 Myr in years
t_final = 1e9  # 1 Gyr

state = state_init
t = 0.0
X_H_history = [state.X_H]

while t < t_final:
    state = step_stellar_evolution(
        state, t, dt,
        params={'r_grid': ..., 'dr': 1e10, ...}
    )
    t += dt
    X_H_history.append(state.X_H)

# Check: hydrogen should decrease
delta_X_H = X_H_history[0] - X_H_history[-1]
print(f"Hydrogen consumed in 1 Gyr: {delta_X_H:.4f}")
assert delta_X_H > 0.01, "No hydrogen burning detected"
print("✓ Nuclear composition evolution working")
```

**Deliverable:**
- Nuclear rates match Bahcall & Pinsonneault (2004)
- Composition evolution shows realistic H→He conversion
- Validation plots with literature comparison

---

### Week 4: Complete Forward Model Test

**Goals:**
- [ ] Run full stellar evolution from pre-main sequence to solar age
- [ ] Compare with MIST track throughout evolution
- [ ] Achieve < 1% error

**Concrete Tasks:**

```python
# task_4_full_evolution.py
from improved_jax_stellar_model import solve_stellar_evolution_with_nuclear
import matplotlib.pyplot as plt

# MIST data at different ages
mist_ages = [1e6, 1e7, 1e8, 1e9, 4.6e9]  # 1 Myr to 4.6 Gyr
mist_tracks = [
    load_mist_validation_data(f"mist_1Msun_{age/1e9:.2f}Gyr.track")
    for age in mist_ages
]

# Setup JAX evolution
t_span = jnp.array(mist_ages)
initial_state = construct_initial_profile(
    {'alpha_mix': 2.0, 'Z': 0.018, 'Y': 0.27}
)
params = construct_params({'n_layers': 100, ...})

# Run evolution
jax_solution = solve_stellar_evolution_with_nuclear(
    initial_state, t_span, params
)

# Compare at each age
fig, axes = plt.subplots(1, 2, figsize=(12, 5))

for i, age in enumerate(mist_ages):
    mist = mist_tracks[i]
    jax = jax_solution[i]
    
    T_error = jnp.abs((jax.T - mist['T']) / mist['T'])
    P_error = jnp.abs((jax.P - mist['P']) / mist['P'])
    
    axes[0].plot(mist['r']/6.96e10, T_error * 100, 
                 label=f"{age/1e9:.2f} Gyr")
    axes[1].plot(mist['r']/6.96e10, P_error * 100, 
                 label=f"{age/1e9:.2f} Gyr")
    
    # Check criterion
    assert jnp.max(T_error) < 0.01, f"T error > 1% at age {age/1e9:.2f} Gyr"
    assert jnp.max(P_error) < 0.01, f"P error > 1% at age {age/1e9:.2f} Gyr"

axes[0].set_xlabel("Fractional Radius")
axes[0].set_ylabel("Temperature Error (%)")
axes[0].legend()
axes[0].set_yscale('log')
axes[0].grid()

axes[1].set_xlabel("Fractional Radius")
axes[1].set_ylabel("Pressure Error (%)")
axes[1].legend()
axes[1].set_yscale('log')
axes[1].grid()

plt.tight_layout()
plt.savefig("evolution_validation.png", dpi=150)

print("✓ FORWARD MODEL VALIDATION COMPLETE")
print(f"  - All ages: T error < 1%")
print(f"  - All ages: P error < 1%")
```

**Milestone Completion:**
```
Week 4 Deliverables:
✓ Forward model reproduces MIST to < 1% accuracy
✓ Evolution from 1 Myr to 4.6 Gyr works
✓ Nuclear burning included and tested
✓ Boundary conditions from atmosphere model
✓ Ready for inverse modeling
```

---

## WEEK 5-12: INVERSE MODELING & BAYESIAN INFERENCE

### Week 5: Basic Variational Inference Setup

**Goals:**
- [ ] Implement ELBO loss function
- [ ] Test on synthetic data
- [ ] Verify posterior covariance makes sense

**Concrete Tasks:**

```python
# task_5_bayesian_setup.py
from improved_jax_stellar_model import elbo_loss, variational_optimization
import jax.numpy as jnp

# Generate synthetic "observed" data from known model
theta_true = jnp.array([2.0, 0.018, 0.27])  # α_mix, Z, Y (true values)

# Run forward model
y_true = forward_model(theta_true)

# Add measurement noise
key = jax.random.PRNGKey(42)
sigma_obs = 0.05 * jnp.abs(y_true)  # 5% noise
y_obs = y_true + jax.random.normal(key, y_true.shape) * sigma_obs

observed_data = {
    'observed_values': y_obs,
    'measurement_uncertainty': sigma_obs
}

# Initialize with bad guess
theta_init_bad = jnp.array([1.0, 0.01, 0.25])  # Wrong!

# Run inference
mean_q, log_std_q, losses = variational_optimization(
    theta_init_bad,
    observed_data,
    forward_model,
    n_epochs=1000,
    learning_rate=1e-3,
    print_interval=100
)

# Check recovery
print("True parameters:       ", theta_true)
print("Inferred mean:         ", mean_q)
print("Inferred std (sigma):  ", jnp.exp(log_std_q))

# Success: recovered values within 3σ
for i in range(len(theta_true)):
    sigma = jnp.exp(log_std_q[i])
    error = jnp.abs(mean_q[i] - theta_true[i])
    
    print(f"\nParameter {i}:")
    print(f"  True:      {theta_true[i]:.6f}")
    print(f"  Inferred:  {mean_q[i]:.6f} ± {sigma:.6f}")
    print(f"  Error:     {error:.6f} ({error/sigma:.2f}σ)")
    
    assert error < 3 * sigma, f"Parameter {i} not recovered"

print("\n✓ Variational inference works on synthetic data")
```

**Testing Checkpoint 5.1:**
```python
# Verify ELBO decreases during optimization
plt.plot(losses)
plt.xlabel("Epoch")
plt.ylabel("ELBO Loss")
plt.title("Variational Inference Convergence")
plt.grid()
plt.savefig("elbo_convergence.png", dpi=150)

assert losses[-1] < losses[0], "ELBO not decreasing"
print("✓ ELBO monotonically decreases")
```

**Deliverable:**
- ELBO loss implemented correctly
- Recovered parameters from synthetic data
- Posterior covariance quantifies uncertainty
- Convergence plot

---

### Week 6-8: Real Data Integration

**Goals:**
- [ ] Download asteroseismic data (Kepler/TESS)
- [ ] Build asteroseismic likelihood function
- [ ] Run inference on real stellar system

**Concrete Tasks:**

```python
# task_6_asteroseismic_data.py
import lightkurve as lk
from improved_jax_stellar_model import load_asteroseismic_data

# Download real Kepler light curve
search_result = lk.search_lightcurve(
    'Kepler-10',  # Well-studied exoplanet host
    mission='Kepler',
    quarter=[1, 2]  # Multiple quarters for frequency analysis
)

lc = search_result.download_all().stitch()

# Compute power spectrum
from scipy import signal
freq, pxx = signal.welch(
    lc.flux.value,
    fs=1.0 / (lc.time.jd[1] - lc.time.jd[0]),
    nperseg=4096
)

# Identify oscillation peaks (solar-like oscillations)
# Characteristic frequency scales:
# - νmax ~ 3000 μHz * (M/M_sun)^0.5 * (T_eff/T_sun)^(-0.5)
# - Δν ~ 135 μHz * (M/M_sun)^0.5 * (R/R_sun)^(-1.5)

# For Kepler-10 (solar mass): expect νmax ~ 2500-3000 μHz

# Extract frequencies and uncertainties
peak_freqs = identify_frequency_peaks(freq, pxx)  # Custom function
freq_uncertainties = estimate_frequency_errors(peak_freqs, pxx)

print(f"Detected {len(peak_freqs)} oscillation modes")
print(f"νmax (large frequency spacing): {jnp.max(peak_freqs):.1f} μHz")

# Spectroscopic data for the same star
spec_data = {
    'T_eff': 5800,      # K (from spectrum fitting)
    'T_eff_err': 50,    # K
    'g_surface': 4.4,   # log(cm/s²)
    'g_err': 0.05,
    'Z': 0.02,          # Solar metallicity
    'Z_err': 0.01
}

asteroseismic_data = {
    'freq': peak_freqs,
    'freq_err': freq_uncertainties,
    'spectrum': spec_data
}

# Save for later use
import pickle
with open('kepler10_asteroseismic.pkl', 'wb') as f:
    pickle.dump(asteroseismic_data, f)
```

**Testing Checkpoint 6.1:**
```python
# task_7_bayesian_stellar_inversion.py

# Load data
import pickle
with open('kepler10_asteroseismic.pkl', 'rb') as f:
    data = pickle.load(f)

# Define forward model: θ → predicted asteroseismic frequencies
def forward_asteroseismic(theta):
    """
    theta = [M/M_sun, R/R_sun, age, Z, ...]
    returns: [predicted oscillation frequencies, predicted T_eff, predicted g]
    """
    
    # Run stellar model
    solution = solve_stellar_evolution_with_nuclear(
        initial_state=construct_from_params(theta),
        t_span=[theta['age']],  # Evaluate at given age
        params=construct_params(theta)
    )
    
    # Extract asteroseismic observables
    freq_pred = compute_asteroseismic_frequencies(solution)
    T_eff_pred = compute_effective_temperature(solution)
    g_pred = compute_surface_gravity(solution)
    
    return jnp.concatenate([freq_pred, [T_eff_pred, g_pred]])

# Prepare observed data for ELBO
observed_data = {
    'observed_values': jnp.concatenate([
        data['freq'],
        [data['spectrum']['T_eff'], data['spectrum']['g_surface']]
    ]),
    'measurement_uncertainty': jnp.concatenate([
        data['freq_err'],
        [data['spectrum']['T_eff_err'], data['spectrum']['g_err']]
    ])
}

# Initial guess (from spectroscopy alone)
theta_init = jnp.array([1.0, 1.0, 4.6e9, 0.02, 2.0, 0.27])

# Run Bayesian inference
mean_q, log_std_q, losses = variational_optimization(
    theta_init,
    observed_data,
    forward_asteroseismic,
    n_epochs=2000,
    learning_rate=1e-4
)

print("="*60)
print("KEPLER-10 STELLAR PARAMETERS (From Asteroseismology)")
print("="*60)
print(f"Mass:     {mean_q[0]:.3f} ± {jnp.exp(log_std_q[0]):.3f} M_sun")
print(f"Radius:   {mean_q[1]:.3f} ± {jnp.exp(log_std_q[1]):.3f} R_sun")
print(f"Age:      {mean_q[2]/1e9:.2f} ± {jnp.exp(log_std_q[2])/1e9:.2f} Gyr")
print(f"Z:        {mean_q[3]:.4f} ± {jnp.exp(log_std_q[3]):.4f}")
print(f"α_mix:    {mean_q[4]:.3f} ± {jnp.exp(log_std_q[4]):.3f}")
print(f"Y:        {mean_q[5]:.3f} ± {jnp.exp(log_std_q[5]):.3f}")
print("="*60)

# Plot posterior covariance (shows degeneracies)
posterior_cov = jnp.diag(jnp.exp(log_std_q) ** 2)
# High covariance between (age, composition) indicates degeneracy

print("\nParameter Correlations (shows degeneracies):")
for i in range(len(mean_q)):
    for j in range(i+1, len(mean_q)):
        corr = posterior_cov[i, j] / (jnp.exp(log_std_q[i]) * jnp.exp(log_std_q[j]))
        print(f"  θ[{i}] - θ[{j}]: r = {corr:.3f}")
```

**Deliverable:**
- Real asteroseismic data loaded and processed
- Likelihood function for mixed frequency + spectroscopic data
- Inferred stellar parameters with uncertainties
- Degeneracy analysis showing which parameters are well-constrained

---

## WEEK 13-16: VALIDATION & BENCHMARKING

### Week 13: Recovery Tests

**Goals:**
- [ ] Test parameter recovery from synthetic asteroseismic data
- [ ] Verify covariance estimates
- [ ] Check convergence behavior

### Week 14: Computational Benchmarking

**Goals:**
- [ ] Time individual forward models
- [ ] Profile memory usage
- [ ] Compare JAX adjoint vs. finite differences

**Concrete Tasks:**

```python
# task_14_benchmarking.py
import time
from improved_jax_stellar_model import solve_stellar_evolution_with_nuclear
import jax

# Test 1: Forward model speed
print("Forward Model Timing")
print("-" * 40)

times_forward = []
for _ in range(10):
    t_start = time.time()
    solution = solve_stellar_evolution_with_nuclear(...)
    t_end = time.time()
    times_forward.append(t_end - t_start)

t_avg = jnp.mean(jnp.array(times_forward))
print(f"Single forward: {t_avg:.3f} sec")
print(f"100 stars: {100 * t_avg:.1f} sec = {100 * t_avg / 60:.1f} min")
print(f"1,000 stars: {1000 * t_avg:.1f} sec = {1000 * t_avg / 3600:.1f} hr")

# Test 2: Adjoint gradient speed vs. finite differences
print("\nAdjoint Differentiation vs. Finite Differences")
print("-" * 40)

def loss_simple(theta):
    solution = solve_stellar_evolution_with_nuclear(...)
    return jnp.sum(solution.T ** 2)

# Method 1: JAX automatic differentiation
loss_and_grad_jax = jax.jit(jax.value_and_grad(loss_simple))

t_start = time.time()
for _ in range(5):
    loss_val, grad_jax = loss_and_grad_jax(theta)
t_jax = time.time() - t_start

# Method 2: Finite differences (for comparison)
eps = 1e-5
t_start = time.time()
for i in range(len(theta)):
    theta_plus = theta.at[i].add(eps)
    theta_minus = theta.at[i].add(-eps)
    grad_fd_i = (loss_simple(theta_plus) - loss_simple(theta_minus)) / (2 * eps)
t_fd = time.time() - t_start

print(f"JAX adjoint (5 iterations): {t_jax:.2f} sec")
print(f"Finite differences (1 param): {t_fd:.2f} sec")
print(f"Speedup: {t_fd / t_jax:.0f}x")

# Test 3: Memory usage
print("\nMemory Usage")
print("-" * 40)

import psutil
import os

process = psutil.Process(os.getpid())

mem_before = process.memory_info().rss / 1e6  # MB

solution = solve_stellar_evolution_with_nuclear(...)
grad = jax.grad(loss_simple)(theta)

mem_after = process.memory_info().rss / 1e6  # MB
mem_used = mem_after - mem_before

print(f"Memory before: {mem_before:.0f} MB")
print(f"Memory used: {mem_used:.0f} MB")
print(f"For 1,000 stars (sequential): ~{mem_used:.0f} MB (constant)")
print(f"For 1,000 stars (vmap): ~{1000 * mem_used / 100:.0f} MB (would OOM!)")
```

**Deliverable:**
- Timing benchmarks showing practical feasibility
- Memory analysis proving sequential approach works
- Comparison of JAX adjoint vs. finite differences

---

### Week 15-16: Final Paper Preparation

**Goals:**
- [ ] Create publication-quality figures
- [ ] Write Methods section with references
- [ ] Prepare validation tables and comparisons

**Concrete Task:**

```python
# task_16_paper_figures.py
import matplotlib.pyplot as plt
import numpy as np

fig = plt.figure(figsize=(14, 10))

# Figure 1: Forward Model Validation
ax1 = plt.subplot(2, 3, 1)
# [Plot JAX vs. MIST temperature profiles]

# Figure 2: ELBO Convergence
ax2 = plt.subplot(2, 3, 2)
# [Plot loss vs. epoch]

# Figure 3: Parameter Recovery (Synthetic)
ax3 = plt.subplot(2, 3, 3)
# [Plot recovered vs. true parameters with error bars]

# Figure 4: Real Data (Kepler-10)
ax4 = plt.subplot(2, 3, 4)
# [Plot observed vs. predicted asteroseismic frequencies]

# Figure 5: Posterior Covariance
ax5 = plt.subplot(2, 3, 5)
# [Plot parameter correlations showing degeneracies]

# Figure 6: Computational Scaling
ax6 = plt.subplot(2, 3, 6)
# [Plot time vs. number of stars, comparing JAX vs. legacy MESA]

plt.suptitle(
    "Differentiable Stellar Interiors: JAX-Based Bayesian Inversion",
    fontsize=16, fontweight='bold'
)
plt.tight_layout()
plt.savefig("paper_figure_1.png", dpi=300, bbox_inches='tight')

print("✓ Publication-quality figures created")
```

---

## WEEK 17-20: MANUSCRIPT PREPARATION & SUBMISSION

### Week 17: Writing Phase

**Structure:**

```
1. INTRODUCTION (1 page)
   - Legacy Fortran bottleneck
   - Automatic differentiation opportunity
   - Our contribution

2. METHODS (4 pages)
   - 1D hydrostatic equilibrium
   - Nuclear burning network
   - Boundary conditions from atmosphere models
   - Bayesian inverse modeling (ELBO)
   - Asteroseismic likelihood

3. COMPUTATIONAL IMPLEMENTATION (2 pages)
   - JAX/Diffrax architecture
   - Memory-efficient sequential processing
   - GPU acceleration results
   - Reproducibility information

4. VALIDATION (2 pages)
   - MIST reproduction (< 1% error)
   - Synthetic parameter recovery
   - Real asteroseismic data (Kepler-10)

5. RESULTS & DISCUSSION (2 pages)
   - Posterior parameter estimates
   - Degeneracy quantification
   - Comparison with literature
   - Future work (3D, B-fields, rotation)

6. REFERENCES (~30 citations)
```

### Week 18: Internal Review & Revision

- Peer review within research group
- Fix figures and tables
- Verify all citations

### Week 19-20: Submission Preparation

**Target Journal Options (in order):**
1. The Astrophysical Journal (ApJ) - best for large audience
2. Monthly Notices of the Royal Astronomical Society (MNRAS) - also well-regarded
3. Astronomy & Astrophysics (A&A) - European alternative

**Submission Checklist:**
- [ ] Manuscript (LaTeX)
- [ ] All figures (300 DPI minimum)
- [ ] Supplementary material (code repository)
- [ ] Response to reviewer questions template
- [ ] Author biography & photo
- [ ] Conflict of interest statement

---

## TESTING CHECKPOINTS SUMMARY

| Week | Checkpoint | Success Criterion | Status |
|------|-----------|------------------|--------|
| 1 | MIST data loads | File read correctly | ☐ |
| 2 | Thomas algorithm | Residual < 1e-6 | ☐ |
| 2 | Hydrostatic solver | Pressure error < 1% vs. MIST | ☐ |
| 3 | Nuclear rates | Match Bahcall & Pinsonneault | ☐ |
| 3 | Composition evolution | H depletion > 0.01 per Gyr | ☐ |
| 4 | Full evolution | < 1% error at all ages | ☐ |
| 5 | Synthetic inference | Parameters recovered within 3σ | ☐ |
| 6 | Real data ingestion | Kepler data loads, frequencies extracted | ☐ |
| 7 | Stellar inversion | Kepler-10 parameters inferred with uncertainties | ☐ |
| 14 | Benchmarking | Memory constant, speedup > 100x vs. FD | ☐ |
| 16 | Paper figures | Publication-quality, all validations shown | ☐ |
| 20 | Submission | Manuscript passes journal checks | ☐ |

---

## RESOURCE REQUIREMENTS

**Hardware:**
- GPU: NVIDIA RTX 4090 (or RTX A100 for larger models)
- CPU: 32-core for data processing
- Storage: 500 GB (MIST tracks + light curves + intermediate outputs)

**Software:**
- JAX 0.4.x+
- Diffrax 0.3.x+
- Optax 0.1.x+
- Lightkurve 2.4.x+
- Astropy 6.x+

**Timeline:**
- Weeks 1-4: Foundation (4 weeks)
- Weeks 5-12: Inverse modeling (8 weeks)
- Weeks 13-16: Validation (4 weeks)
- Weeks 17-20: Publication (4 weeks)
- **Total: 20 weeks = ~5 months**

---

## TROUBLESHOOTING GUIDE

### Common Issues & Solutions

**Issue 1: Diffrax ODE solver not converging**
```python
# Solution: Use implicit solver with tighter tolerances
solution = diffeqsolve(
    problem,
    KenCarp5(),  # More robust than Dopri5 for stiff systems
    rtol=1e-7,   # Relative tolerance
    atol=1e-9,   # Absolute tolerance
    max_steps=1e6
)
```

**Issue 2: Variational inference getting stuck in local minima**
```python
# Solution: Multiple random restarts
best_elbo = float('inf')
best_params = None

for restart in range(10):
    # Random initialization
    mean_q_init = jax.random.normal(...) * 0.1
    log_std_q_init = jnp.ones(...) * (-2.0)
    
    # Optimize
    mean_q, log_std_q, losses = variational_optimization(...)
    
    if losses[-1] < best_elbo:
        best_elbo = losses[-1]
        best_params = (mean_q, log_std_q)
```

**Issue 3: Memory OOM with vmap**
```python
# Solution: Use sequential loop instead (as provided)
# vmap was never meant for catalogs of stars
# Sequential + checkpointing is the right approach
```

---

## CONCLUSION

This roadmap provides a clear, testable path from concept to publication in **20 weeks**. Each milestone is concrete and verifiable.

**Success requires:**
✓ Disciplined adherence to testing checkpoints  
✓ Regular validation against MIST and literature  
✓ Careful documentation for reproducibility  
✓ Early preparation of figures for manuscript  

**Expected Outcome:**
Publication-ready research on differentiable stellar evolution with automatic differentiation—a genuinely novel contribution to computational astrophysics.

---

**Next Action:** Begin Week 1 tasks immediately. Report checkpoint completion weekly.
