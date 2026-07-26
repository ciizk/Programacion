        </main>
    </div>
</div>
<script>
    (function () {
        var sb = document.getElementById('sidebar');
        var bd = document.getElementById('backdrop');
        document.getElementById('hamburger')?.addEventListener('click', function () {
            sb?.classList.toggle('open'); bd?.classList.toggle('open');
        });
        bd?.addEventListener('click', function () { sb?.classList.remove('open'); bd?.classList.remove('open'); });
    })();
</script>
</body>
</html>
