const SUPABASE_URL = 'https://fqwiaaddpqhyztvrkxvw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZxd2lhYWRkcHFoeXp0dnJreHZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMyMTcyMjIsImV4cCI6MjEwODc5MzIyMn0.3QkQtw3kH2Tj27ZLcQc45TI6Uw5USzpTXrQhjxRMo0A';

if (window.supabase) {
    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    document.addEventListener('DOMContentLoaded', () => {
        const form = document.getElementById('comment-form');
        const nameInput = document.getElementById('comment-name');
        const passwordInput = document.getElementById('comment-password');
        const textInput = document.getElementById('comment-text');
        const commentList = document.getElementById('comment-list');

        if (!form || !commentList) return;

        fetchComments();

        // 1. 댓글 목록 불러오기
        async function fetchComments() {
            const { data, error } = await supabase
                .from('comments')
                .select('*')
                .order('id', { ascending: false });

            if (error) {
                console.error('反應 呼出 不可!:', error);
                return;
            }

            commentList.innerHTML = '';
            
            data.forEach(comment => {
                const li = document.createElement('li');
                li.style.marginBottom = "10px";
                li.style.padding = "10px";
                li.style.border = "1px solid #eee";
                li.style.borderRadius = "5px";

                // 댓글 내용 + 수정/삭제 버튼 구성
                li.innerHTML = `
                    <strong>${escapeHtml(comment.name)}</strong>
                    <p style="margin: 5px 0 8px 0;">${escapeHtml(comment.text)}</p>
                    <div style="font-size: 12px;">
                        <button class="edit-btn" data-id="${comment.id}" style="margin-right: 5px; cursor: pointer; padding: 2px 6px;">修正</button>
                        <button class="delete-btn" data-id="${comment.id}" style="cursor: pointer; padding: 2px 6px;">削除</button>
                    </div>
                `;

                commentList.appendChild(li);
            });

            // --- [삭제 버튼 이벤트 처리] ---
            document.querySelectorAll('.delete-btn').forEach(button => {
                button.addEventListener('click', async function() {
                    const commentId = this.getAttribute('data-id');
                    await verifyAndExecute(commentId, 'delete');
                });
            });

            // --- [수정 버튼 이벤트 처리] ---
            document.querySelectorAll('.edit-btn').forEach(button => {
                button.addEventListener('click', async function() {
                    const commentId = this.getAttribute('data-id');
                    await verifyAndExecute(commentId, 'edit');
                });
            });
        }

        // 비밀번호 검증 후 삭제 또는 수정 수행 함수
        async function verifyAndExecute(commentId, actionType) {
            // 해당 댓글의 비밀번호 가져오기
            const { data: targetData, error: fetchError } = await supabase
                .from('comments')
                .select('password, text')
                .eq('id', commentId)
                .single();

            if (fetchError || !targetData) {
                alert('反應 確認 不可!');
                return;
            }

            // 만약 댓글에 비밀번호가 설정되어 있다면 검증 진행
            if (targetData.password && targetData.password.trim() !== '') {
                const inputPassword = prompt('認證番號 入力');
                if (inputPassword === null) return; // 취소 버튼 누름

                if (inputPassword !== targetData.password) {
                    alert('認證番號 不一致!');
                    return;
                }
            }

            // 1) 삭제 작업
            if (actionType === 'delete') {
                if (!confirm('眞心?')) return;

                const { error: deleteError } = await supabase
                    .from('comments')
                    .delete()
                    .eq('id', commentId);

                if (deleteError) {
                    alert('削除 失敗!');
                    console.error(deleteError);
                    return;
                }

                alert('完了.');
                fetchComments();
            }

            // 2) 수정 작업
            else if (actionType === 'edit') {
                const newText = prompt('修正 內容 入力', targetData.text);
                if (newText === null) return; // 취소 버튼 누름
                if (newText.trim() === '') {
                    alert('空白 內容 不可!');
                    return;
                }

                const { error: updateError } = await supabase
                    .from('comments')
                    .update({ text: newText.trim() })
                    .eq('id', commentId);

                if (updateError) {
                    alert('反應 修正 失敗!');
                    console.error(updateError);
                    return;
                }

                alert('完了.');
                fetchComments();
            }
        }

        // 2. 댓글 작성하기 (비밀번호는 선택 사항)
        form.addEventListener('submit', async function(e) {
            e.preventDefault();

            const name = nameInput.value.trim();
            const password = passwordInput.value.trim(); // 비어있어도 됨
            const text = textInput.value.trim();

            if (name === '' || text === '') {
                alert('名札,本文(必要)!');
                return;
            }

            const { error } = await supabase
                .from('comments')
                .insert([{ 
                    name: name, 
                    password: password !== '' ? password : null, 
                    text: text 
                }]);

            if (error) {
                alert('貯藏 失敗!');
                console.error(error);
                return;
            }

            // 입력창 초기화
            nameInput.value = '';
            passwordInput.value = '';
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
    console.error('Supabase SDK呼出 不可!');
}