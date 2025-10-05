"""
gui.py
Interface Gráfica (Tkinter) do Sistema Acadêmico - PIM II
-----------------------------------------------------------
CORREÇÃO: Acesso aos dados do aluno agora é feito como
dicionário (ex: aluno['nome']) para evitar erros.
-----------------------------------------------------------"""

import tkinter as tk
from tkinter import ttk, messagebox
import storage

DB_FILE = "dados.json"

class SistemaGUI(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("Sistema Acadêmico - PIM II")
        self.geometry("700x450")
        self.config(bg="#f0f0f0")

        tk.Label(self, text="Alunos Sincronizados", font=("Arial", 16, "bold"), bg="#f0f0f0").pack(pady=10)

        # Adicionada coluna para o "Insight" da IA
        self.tree = ttk.Treeview(self, columns=("nome", "media", "status", "insight"), show="headings")

        colunas = {
            "nome": ("Nome", 200),
            "media": ("Média", 80),
            "status": ("Status", 150),
            "insight": ("Feedback da IA", 250)
        }
        for col_id, (text, width) in colunas.items():
            self.tree.heading(col_id, text=text)
            self.tree.column(col_id, anchor="center", width=width)

        self.tree.pack(expand=True, fill="both", padx=20, pady=10)

        tk.Button(self, text="🔄 Atualizar", command=self.atualizar, bg="#007acc", fg="white").pack(pady=10)
        self.atualizar()

    def atualizar(self):
        """Recarrega os dados do JSON e atualiza a tabela."""
        try:
            db = storage.carregar_json(DB_FILE)
            alunos = db.get("alunos", [])
        except Exception as e:
            messagebox.showerror("Erro de Leitura", f"Não foi possível ler o arquivo de dados:\n{e}")
            return

        for item in self.tree.get_children():
            self.tree.delete(item)

        if not alunos:
            # Mostra uma mensagem na própria tabela se estiver vazia
            self.tree.insert("", "end", values=("", "Nenhum aluno sincronizado ainda.", "", ""))
            return

        # CORREÇÃO: Acessa os dados como dicionário
        for aluno in alunos:
            self.tree.insert("", "end", values=(
                aluno.get('nome', 'N/A'),
                f"{aluno.get('media', 0.0):.2f}",
                aluno.get('status', 'N/A'),
                aluno.get('insight', 'N/A')
            ))

if __name__ == "__main__":
    app = SistemaGUI()
    app.mainloop()
