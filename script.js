const apiKeyInput = document.getElementById('apiKey');
const gameSelect = document.getElementById('gameSelect');
const questionInput = document.getElementById('questionInput');
const askButton = document.getElementById('askButton');
const aiResponse = document.getElementById('aiResponse');
const form = document.getElementById('form');

const markdownToHTML = (text) => {
  const converter = new showdown.Converter();
  return converter.makeHtml(text);
};

const perguntarIA = async (question, game, apiKey) => {
    const model = "gemini-2.5-flash"
    const geminiURL = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const pergunta = `
        ## Especialidade
            Você é um especialista assistente de meta para o ${game} 
       
        ## Tarefa
            Você deve responder perguntas do usuario sobre estratégias, build e dicas para jogos de esportes.
        
        ## Regras 
            -Se você não sabe a resposta, responda com "Desculpe, não sei" e não tente inventar uma resposta.
            -Se a pergunta não esta relaciona ao jgoo, responda com essa pergunta "não está relacionada ao jogo".
            -Considere a data atual ${new Date().toLocaleDateString()}
            -Faça pesquisas atualizadas sobre o patch atual, baseado no jogo e a data atual.
            -Nunca responda itens que você não tenha certeza de que existe no patch atual.
            -Responda sempre em português(pt-BR).
            
        ## Resposta
            -Economize na resposta, seja direto e responda no maximo 500 caracteres. 
            -Responda em markdown
            -Não precdisa fazer nenhuma saudação ou despedida, apenas responda o que o usuário perguntou.
            -Responda sempre em português(pt-BR).

        ## Exemplo de resposta
            Pergunta do uuário: Melhor build para Vayne ADC
            resposta: A build mais atual é: /n/n **Itens:**/n/n coloque os itens aqui. /n/n**Runas:**/n/n exemplo de runas /n/n **dicas** /n/n exemplo de dicas.

            ---
            aqui está a pergunta do usuário: ${question}
    `
    const contents = [{
        role: "user",
        parts: [{
            text: pergunta
        }]
    }]
    
    const tools = [{
        google_search: {}
    }]

    //chamada API
    const response = await fetch(geminiURL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            contents,
            tools
        })
    })

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
}

const enviarFormulario = async (event) => {
    event.preventDefault();
    const apiKey = apiKeyInput.value;
    const game = gameSelect.value;
    const question = questionInput.value;

    if(apiKey == '' || game == '' || question == ''){
        alert('Por favor, preencha todos os campos');
        return;
    }

    askButton.disabled = true;
    askButton.textContent = 'Perguntando...';
    askButton.classList.add('loading');
    
    try{
        //perguntar para IA
        const text = await perguntarIA(question, game, apiKey)
        aiResponse.querySelector('.response-content').innerHTML = markdownToHTML(text)
        aiResponse.classList.remove('hidden');
    } catch(error){
        alert('Chave API inválida')

    } finally{
        askButton.disabled = false;
        askButton.textContent = 'Perguntar';
        askButton.classList.remove('loading');
    }
    

}

form.addEventListener('submit', enviarFormulario);
