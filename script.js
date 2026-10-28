const SUPABASE_URL = 'https://fqwiaaddpqhyztvrkxvw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZxd2lhYWRkcHFoeXp0dnJreHZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMyMTcyMjIsImV4cCI6MjEwODc5MzIyMn0.3QkQtw3kH2Tj27ZLcQc45TI6Uw5USzpTXrQhjxRMo0A';

if (window.supabase) {
    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // 💡 HTML이 완전히 로드된 후에 요소를 찾도록 이 안으로 쏙 집어넣습니다!
    document.addEventListener('DOMContentLoaded', () => {
        const form = document.getElementById('comment-form');
        const nameInput = document.getElementById('comment-name');
        const textInput = document.getElementById('comment-text');
        const commentList = document.getElementById('comment-list');

        // 요소가 없는 페이지에서 에러가 나는 것을 방지
        if (!form || !commentList) return;

        fetchComments();

        async function fetchComments() {
            const { data, error } = await supabase
                .from('comments')
                .select('*')
                .order('id', { ascending: false });

            if (error) {
                console.error('댓글을 불러오는 중 오류가 발생했습니다:', error);
                return;
            }

            commentList.innerHTML = '';
            
            data.forEach(comment => {
                const li = document.createElement('li');
                li.style.marginBottom = "10px";
                li.style.padding = "8px";
                li.style.border = "1px solid #eee";
                li.style.borderRadius = "5px";

                li.innerHTML = `<strong>${escapeHtml(comment.name)}</strong>: <p style="margin: 5px 0 0 0;">${escapeHtml(comment.text)}</p>`;
                commentList.appendChild(li);
            });
        }

        form.addEventListener('submit', async function(e) {
            e.preventDefault();

            const name = nameInput.value.trim();
            const text = textInput.value.trim();

            if (name === '' || text === '') {
                alert('닉네임과 내용을 모두 한 글자 이상 입력해주세요!');
                return;
            }

            const { data, error } = await supabase
                .from('comments')
                .insert([{ name: name, text: text }]);

            if (error) {
                alert('댓글 저장에 실패했습니다.');
                console.error(error);
                return;
            }

            nameInput.value = '';
            textInput.value = '';

            fetchComments();
        });

        function escapeHtml(str) {
            return str.replace(/[&<>'"]/g, 
                tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
            );
        }
    });
} else {
    console.error('Supabase SDK가 로드되지 않았습니다.');
}