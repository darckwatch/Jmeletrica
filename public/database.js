// Importa as funções necessárias do SDK do Firebase que você precisará
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getFirestore, collection, getDocs, doc, setDoc, deleteDoc, addDoc } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

// --- CONFIGURAÇÃO DO FIREBASE ---
// IMPORTANTE: Cole aqui o objeto firebaseConfig que você copiou da consola do Firebase.
const firebaseConfig = {
  apiKey: "AIzaSyD4WkSlsmYKwLu2mbSk_V-ENNPFTVbvLf0",
    authDomain: "jmeletrica-site.firebaseapp.com",
    projectId: "jmeletrica-site",
    storageBucket: "jmeletrica-site.firebasestorage.app",
    messagingSenderId: "755470158837",
    appId: "1:755470158837:web:a5889c171ece86ff8eaebc",
    measurementId: "G-DT582REN65"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- FUNÇÕES DE GESTÃO DE DADOS ---

// Função para carregar todos os documentos de uma coleção (serviços ou máquinas)
async function carregarDados(nomeDaColecao) {
    const querySnapshot = await getDocs(collection(db, nomeDaColecao));
    const dados = [];
    querySnapshot.forEach((doc) => {
        dados.push({ id: doc.id, ...doc.data() });
    });
    return dados;
}

// Função para guardar/atualizar um documento
async function guardarDados(nomeDaColecao, dados, id = null) {
    if (id) {
        // Se um ID for fornecido, atualiza o documento existente
        await setDoc(doc(db, nomeDaColecao, id), dados);
        return id;
    } else {
        // Se não houver ID, cria um novo documento
        const docRef = await addDoc(collection(db, nomeDaColecao), dados);
        return docRef.id;
    }
}

// Função para apagar um documento
async function apagarDados(nomeDaColecao, id) {
    await deleteDoc(doc(db, nomeDaColecao, id));
}

// Exporta as funções para que possam ser usadas em outros ficheiros
export { carregarDados, guardarDados, apagarDados };
