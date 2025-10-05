"""
server.py
Servidor Web com Flask para o novo Sistema Acadêmico PIM.
------------------------------------------------------------------
CORREÇÃO: Agora, o servidor recebe e salva também as informações
das turmas, preenchendo o campo 'turmas' no dados.json.
------------------------------------------------------------------
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
import storage
import c_wrapper
import ai_module

app = Flask(__name__)
CORS(app)

DB_FILE = "dados.json"

@app.route('/api/sync', methods=['POST'])
def sync_data():
    """
    Endpoint para SINCRONIZAR a base de dados.
    Recebe um JSON com alunos e turmas do frontend, processa cada aluno
    e salva o arquivo dados.json com todas as informações.
    """
    dados_recebidos = request.get_json()

    if not dados_recebidos or "alunos" not in dados_recebidos or "turmas" not in dados_recebidos:
        return jsonify({"erro": "JSON inválido. As chaves 'alunos' e 'turmas' são obrigatórias."}), 400

    try:
        # Prepara uma estrutura de banco de dados nova
        db_completo = {"alunos": [], "turmas": [], "aulas": []}

        # 1. Processa e adiciona os alunos
        for aluno_web in dados_recebidos['alunos']:
            aluno_processado = c_wrapper.processar_aluno_c(aluno_web)
            media_aluno = aluno_processado.get("media", 0)
            aluno_processado['insight'] = ai_module.gerar_feedback(media_aluno)
            db_completo['alunos'].append(aluno_processado)

        # 2. Adiciona as turmas diretamente
        db_completo['turmas'] = dados_recebidos['turmas']

        # CORREÇÃO: Garante que a lista de alunos dentro de cada turma no JSON final
        # seja a mesma que foi recebida do frontend.
        # Isso corrige a contagem de "Alunos na turma" no relatório.
        for turma in db_completo['turmas']:
            # Encontra a turma correspondente nos dados recebidos
            turma_frontend = next((t for t in dados_recebidos['turmas'] if t.get('codigo') == turma.get('codigo')), None)
            if turma_frontend:
                turma['alunos'] = turma_frontend.get('alunos', [])


        # 3. Salva a base de dados completa e atualizada
        storage.salvar_json(db_completo, DB_FILE)

        print(f"SUCESSO: Base de dados sincronizada com {len(db_completo['alunos'])} alunos e {len(db_completo['turmas'])} turmas.")
        return jsonify({"mensagem": "Dados e turmas sincronizados com sucesso!"}), 200

    except Exception as e:
        print(f"ERRO: Falha ao sincronizar os dados: {str(e)}")
        return jsonify({"erro": f"Falha interna no servidor: {str(e)}"}), 500


if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000, debug=True)
