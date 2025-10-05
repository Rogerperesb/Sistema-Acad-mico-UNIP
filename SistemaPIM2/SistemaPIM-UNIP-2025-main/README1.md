# 🎓 Sistema Acadêmico PIM - UNIP 2025

Projeto Integrador Multidisciplinar (PIM) do curso de Análise e Desenvolvimento de Sistemas da **UNIP**.  
O sistema permite cadastrar alunos, calcular médias usando um módulo em **C**, gerar **feedback inteligente** via IA e exibir tudo em uma interface **Tkinter**.

---

## 🚀 Funcionalidades
- Cálculo de médias e status via DLL em C (`avg.c`)
- Geração de insights automáticos com IA (`ai_module.py`)
- Armazenamento de dados em arquivo JSON (`storage.py`)
- Interface gráfica com Tkinter (`gui.py`)
- Relatório automático em `.txt`
- Menu de terminal completo (`main.py`)

---

## 🧩 Estrutura de Pastas

📁 PROJETO PIM 2.0
┣ 📂 c_modules
┃ ┗ 📜 avg.c
┣ 📜 ai_module.py
┣ 📜 c_wrapper.py
┣ 📜 gui.py
┣ 📜 main.py
┣ 📜 models.py
┣ 📜 storage.py
┣ 📜 teste_manual.py
┗ 📜 README.md

---

## ⚙️ Tecnologias Utilizadas

| Tecnologia |Descrição |

| 🐍Python 3.11  - Linguagem principal |
| 💽C (MinGW)    - Cálculo de média via DLL |
| 🪟Tkinter      - Interface gráfica |
| 📦JSON / TXT   - Armazenamento e relatórios |
| 🧠IA (Regras simples) - Geração de feedback inteligente |

---

## 🚀 Como Executar

1️-  Compilar o módulo C

2-  No terminal, dentro da pasta do projeto:

3-  gcc -shared -o c_modules/avg.dll -fPIC c_modules/avg.c

---

# ‍💻 Autor

Gabriel Duque
📚Aluno da Universidade Paulista (UNIP) 
📚2 Semestre
📅 Projeto PIM — 2025

---

### ⭐ Deixe uma estrela se gostou do projeto!
