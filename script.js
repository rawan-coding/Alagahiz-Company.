document.getElementById('current-year').textContent = new Date().getFullYear();

const phoneTarget = "201035193743";
const emailTarget = "rawancoding1272007@gmail.com";

// Mobile Menu Toggle
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileMenu = document.getElementById('mobileMenu');
mobileMenuBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
});

// Initialize Tasks
let tasksData = JSON.parse(localStorage.getItem('aljahiz_tasks_v2')) || [
    { id: 'REQ-101', title: 'هوية بصرية كاملة وتصميم لوجو', type: 'هويات بصرية وترسيم براندنج (المصمم: روان محمد)', date: '2026-10-28', status: 'قيد الانتظار' },
    { id: 'REQ-100', title: 'فيديو ريلز وتيك توك 30 ثانية', type: 'مونتاج فيديو وريندر سينمائي (المونتير: خلود خالد)', date: '2026-10-26', status: 'قيد التنفيذ' }
];

function renderTasks() {
    const tbody = document.getElementById('client-tasks-body');
    const adminPending = document.getElementById('admin-pending-tasks');
    tbody.innerHTML = '';
    adminPending.innerHTML = '';

    tasksData.forEach(task => {
        const tr = document.createElement('tr');
        tr.className = 'hover:bg-brand-bg transition-colors';
        tr.innerHTML = `
            <td class="p-3 font-mono font-bold text-brand-lime">${task.id}</td>
            <td class="p-3 font-bold text-white">${task.title}</td>
            <td class="p-3 text-brand-textSub">${task.type}</td>
            <td class="p-3">
                <span class="px-2 py-0.5 rounded text-[10px] font-bold border border-brand-border text-brand-lime">${task.status}</span>
            </td>
            <td class="p-3">
                <a href="https://wa.me/${phoneTarget}?text=${encodeURIComponent('متابعة طلب: ' + task.id + ' - ' + task.title)}" target="_blank" class="text-xs text-white hover:text-brand-lime underline font-bold">متابعة واتساب</a>
            </td>
        `;
        tbody.appendChild(tr);

        if (task.status === 'قيد الانتظار') {
            const div = document.createElement('div');
            div.className = 'p-3 bg-brand-card rounded-lg border border-brand-border text-xs mb-2';
            div.innerHTML = `<div class="font-bold text-white">${task.title}</div><div class="text-brand-textSub mt-1">${task.type}</div>`;
            adminPending.appendChild(div);
        }
    });

    localStorage.setItem('aljahiz_tasks_v2', JSON.stringify(tasksData));
}

renderTasks();

function switchTab(tab) {
    const clientView = document.getElementById('client-portal-view');
    const adminView = document.getElementById('admin-portal-view');
    const clientBtn = document.getElementById('tab-client-btn');
    const adminBtn = document.getElementById('tab-admin-btn');

    if (tab === 'client') {
        clientView.classList.remove('hidden');
        adminView.classList.add('hidden');
        clientBtn.className = "flex-1 py-2 px-4 rounded-lg font-bold text-xs bg-brand-lime text-black transition-all";
        adminBtn.className = "flex-1 py-2 px-4 rounded-lg font-bold text-xs text-brand-textSub hover:text-white transition-all";
    } else {
        clientView.classList.add('hidden');
        adminView.classList.remove('hidden');
        adminBtn.className = "flex-1 py-2 px-4 rounded-lg font-bold text-xs bg-brand-lime text-black transition-all";
        clientBtn.className = "flex-1 py-2 px-4 rounded-lg font-bold text-xs text-brand-textSub hover:text-white transition-all";
    }
}

function toggleNewRequestForm() {
    document.getElementById('new-request-form').classList.toggle('hidden');
}

// ---------- Email delivery (FormSubmit) ----------
// Sends the request straight to emailTarget without a backend.
// NOTE: the first submission triggers an activation email from FormSubmit
// to emailTarget; click the activation link once and all later requests arrive.
async function sendEmail(subject, fields) {
    const res = await fetch(`https://formsubmit.co/ajax/${emailTarget}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ _subject: subject, _template: 'table', _captcha: 'false', ...fields })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || String(data.success) === 'false') {
        throw new Error(data.message || 'email failed');
    }
    return data;
}

function openWhatsApp(msg) {
    const waUrl = `https://wa.me/${phoneTarget}?text=${encodeURIComponent(msg)}`;
    const win = window.open(waUrl, '_blank');
    if (!win) window.location.href = waUrl;
}

function setBusy(form, busy, label) {
    const btn = form.querySelector('button[type="submit"]');
    if (!btn) return;
    if (busy) {
        btn.dataset.label = btn.textContent;
        btn.textContent = label || 'جاري الإرسال...';
        btn.disabled = true;
        btn.classList.add('opacity-60', 'cursor-not-allowed');
    } else {
        btn.textContent = btn.dataset.label || btn.textContent;
        btn.disabled = false;
        btn.classList.remove('opacity-60', 'cursor-not-allowed');
    }
}

async function handleNewRequest(e) {
    e.preventDefault();
    const form = e.target;
    const title = document.getElementById('req-title').value;
    const type = document.getElementById('req-type').value;
    const desc = document.getElementById('req-desc').value;
    const link = document.getElementById('req-link').value;

    const reqId = 'REQ-' + Math.floor(102 + Math.random() * 900);
    const msg = `طلب جديد من موقع على الجاهز⚡\n\nرقم الطلب: ${reqId}\nعنوان المشروع: ${title}\nالخدمة والمصمم: ${type}\nالتفاصيل: ${desc}\nرابط الملفات: ${link || 'لا يوجد'}`;

    setBusy(form, true);
    let emailed = true;
    try {
        await sendEmail('طلب جديد: ' + title, {
            'رقم الطلب': reqId,
            'عنوان المشروع': title,
            'الخدمة والمصمم': type,
            'التفاصيل': desc,
            'رابط الملفات': link || 'لا يوجد'
        });
    } catch (err) {
        emailed = false;
    }
    setBusy(form, false);

    tasksData.unshift({
        id: reqId,
        title: title,
        type: type,
        date: new Date().toISOString().split('T')[0],
        status: 'قيد الانتظار'
    });
    renderTasks();

    openWhatsApp(msg);

    if (!emailed) {
        // Fallback: open the user's mail app with the message prefilled
        window.location.href = `mailto:${emailTarget}?subject=${encodeURIComponent('طلب جديد: ' + title)}&body=${encodeURIComponent(msg)}`;
    }

    form.reset();
    showToast(emailed ? 'تم إرسال الطلب للإيميل والواتساب بنجاح!' : 'تم حفظ الطلب وفتح الواتساب (تعذر الإرسال المباشر للإيميل)');
}

function calculateSalesMetrics() {
    const calls = parseInt(document.getElementById('calc-calls').value);
    const rate = parseInt(document.getElementById('calc-rate').value);
    const price = parseInt(document.getElementById('calc-price').value);

    document.getElementById('calc-calls-val').textContent = `${calls} مكالمة`;
    document.getElementById('calc-rate-val').textContent = `${rate}%`;

    const monthlyCalls = calls * 22;
    const clientsAcquired = Math.max(1, Math.round(monthlyCalls * (rate / 100)));
    const revenue = clientsAcquired * price;

    document.getElementById('res-clients').textContent = `${clientsAcquired} عملاء`;
    document.getElementById('res-revenue').textContent = `${revenue.toLocaleString()} ج.م`;
}

function openSubscribeModal(planName, price) {
    document.getElementById('modal-plan-name').textContent = planName;
    document.getElementById('modal-plan-price').textContent = price;
    const modal = document.getElementById('sub-modal');
    modal.classList.remove('hidden');
    modal.style.display = 'flex';
}

function closeSubscribeModal() {
    const modal = document.getElementById('sub-modal');
    modal.classList.add('hidden');
    modal.style.display = 'none';
}

// Close modal on backdrop click or Escape
document.getElementById('sub-modal').addEventListener('click', (e) => {
    if (e.target.id === 'sub-modal') closeSubscribeModal();
});
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeSubscribeModal();
});

async function handleSubscriptionSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const company = document.getElementById('sub-company').value;
    const name = document.getElementById('sub-name').value;
    const phone = document.getElementById('sub-phone').value;
    const plan = document.getElementById('modal-plan-name').textContent;
    const price = document.getElementById('modal-plan-price').textContent;

    const msg = `طلب اشتراك باقة جديد⚡\n\nالباقة: ${plan} (${price} ج.م / شهرياً)\nالشركة: ${company}\nالاسم: ${name}\nرقم الهاتف: ${phone}`;

    setBusy(form, true);
    let emailed = true;
    try {
        await sendEmail('طلب اشتراك جديد: باقة ' + plan, {
            'الباقة': `${plan} (${price} ج.م / شهرياً)`,
            'الشركة': company,
            'الاسم': name,
            'رقم الهاتف': phone
        });
    } catch (err) {
        emailed = false;
    }
    setBusy(form, false);

    openWhatsApp(msg);

    if (!emailed) {
        window.location.href = `mailto:${emailTarget}?subject=${encodeURIComponent('طلب اشتراك جديد: باقة ' + plan)}&body=${encodeURIComponent(msg)}`;
    }

    form.reset();
    closeSubscribeModal();
    showToast(emailed ? 'تم إرسال طلب الاشتراك للإيميل والواتساب!' : 'تم فتح الواتساب (تعذر الإرسال المباشر للإيميل)');
}

function showToast(message) {
    const toast = document.getElementById('toast');
    document.getElementById('toast-msg').textContent = message;

    toast.classList.remove('translate-y-20', 'opacity-0', 'pointer-events-none');

    setTimeout(() => {
        toast.classList.add('translate-y-20', 'opacity-0', 'pointer-events-none');
    }, 3500);
}