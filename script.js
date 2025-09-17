class F1Simulator {
    constructor() {
        this.timer = 0;
        this.timerInterval = null;
        this.isRunning = false;
        this.isSequenceActive = false;
        this.currentLight = 0;
        this.lights = [];
        this.history = [];
        this.penalties = [];
        this.isPenaltyActive = false;
        this.isAdminAuthenticated = false;
        this.adminPassword = 'F1Meme2024'; // Contraseña de administrador
        
        // Configuración para JSONBin.io
        this.jsonBinId = '68cb035bae596e708ff225c2'; // Reemplazar con tu ID real
        this.jsonBinApiKey = '$2a$10$2xckt0U4DCYlV7O8rHyvbe61yFkmmFI9Lq2.odr0xsofVJ8.u03Jy'; // Reemplazar con tu API key
        
        this.initializeElements();
        this.initializeEventListeners();
        this.loadHistory();
        
        // Recargar datos cada 5 segundos para sincronización
        setInterval(() => {
            this.loadDataFromCloud();
        }, 5000);
    }

    initializeElements() {
        this.timerDisplay = document.getElementById('timer');
        this.timerStatus = document.getElementById('timerStatus');
        this.startButton = document.getElementById('startButton');
        this.resetButton = document.getElementById('resetButton');
        this.participantName = document.getElementById('participantName');
        this.historyList = document.getElementById('historyList');
        this.clearHistoryBtn = document.getElementById('clearHistory');
        this.adminLoginBtn = document.getElementById('adminLogin');
        this.adminModal = document.getElementById('adminModal');
        this.adminPasswordInput = document.getElementById('adminPassword');
        this.loginBtn = document.getElementById('loginBtn');
        this.cancelBtn = document.getElementById('cancelBtn');
        this.closeModal = document.querySelector('.close');
        this.loginError = document.getElementById('loginError');
        
        // Obtener todos los semáforos
        for (let i = 1; i <= 5; i++) {
            this.lights.push(document.getElementById(`light${i}`));
        }
    }

    initializeEventListeners() {
        // Evento de tecla espacio para PC
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && !this.isSequenceActive && !this.isRunning && !this.isPenaltyActive) {
                e.preventDefault();
                this.startSequence();
            } else if (e.code === 'Space' && this.isRunning) {
                e.preventDefault();
                this.stopTimer();
            } else if (e.code === 'Space' && this.isSequenceActive && !this.isRunning) {
                e.preventDefault();
                this.handleFalseStart();
            } else if (e.code === 'Space' && this.isPenaltyActive) {
                e.preventDefault();
                // No hacer nada cuando hay penalización activa
                // El usuario debe usar el botón REINICIAR
            }
        });

        // Botón de arranque para móvil
        this.startButton.addEventListener('click', () => {
            if (!this.isSequenceActive && !this.isRunning && !this.isPenaltyActive) {
                this.startSequence();
            } else if (this.isRunning) {
                this.stopTimer();
            } else if (this.isSequenceActive && !this.isRunning) {
                this.handleFalseStart();
            } else if (this.isPenaltyActive) {
                // Cuando hay penalización, el botón actúa como reinicio
                this.resetAll();
            }
        });

        // Botón de reinicio
        this.resetButton.addEventListener('click', () => {
            this.resetAll();
        });

        // Botón de limpiar historial
        this.clearHistoryBtn.addEventListener('click', () => {
            this.clearHistory();
        });

        // Sistema de administrador
        this.adminLoginBtn.addEventListener('click', () => {
            this.showAdminModal();
        });

        this.loginBtn.addEventListener('click', () => {
            this.authenticateAdmin();
        });

        this.cancelBtn.addEventListener('click', () => {
            this.hideAdminModal();
        });

        this.closeModal.addEventListener('click', () => {
            this.hideAdminModal();
        });

        // Cerrar modal al hacer click fuera de él
        this.adminModal.addEventListener('click', (e) => {
            if (e.target === this.adminModal) {
                this.hideAdminModal();
            }
        });

        // Permitir login con Enter
        this.adminPasswordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.authenticateAdmin();
            }
        });

        // Detectar si es dispositivo móvil
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        if (this.isMobile) {
            this.startButton.style.display = 'block';
            this.timerStatus.textContent = 'Toca el botón para arrancar';
        } else {
            this.startButton.style.display = 'block';
            this.timerStatus.textContent = 'Presiona ESPACIO para arrancar';
        }
    }

    startSequence() {
        if (this.isSequenceActive || this.isPenaltyActive) return;
        
        this.isSequenceActive = true;
        this.isPenaltyActive = false;
        this.currentLight = 0;
        this.startButton.disabled = true;
        this.timerStatus.textContent = 'Preparándose...';
        this.timerStatus.style.color = '#ff6b35';
        
        // Secuencia de encendido de semáforos
        this.sequenceInterval = setInterval(() => {
            if (this.currentLight < 5) {
                this.lightUpTrafficLight(this.currentLight);
                this.currentLight++;
            } else {
                // Todos los semáforos están encendidos, esperar un momento y apagar todos
                clearInterval(this.sequenceInterval);
                setTimeout(() => {
                    this.turnOffAllLights();
                    // Solo iniciar el cronómetro si no hay penalización activa
                    if (!this.isPenaltyActive) {
                        this.startTimer();
                    }
                }, 1000);
            }
        }, 800);
    }

    async handleFalseStart() {
        if (!this.isSequenceActive || this.isRunning) return;
        
        // Detener la secuencia
        if (this.sequenceInterval) {
            clearInterval(this.sequenceInterval);
        }
        
        this.isSequenceActive = false;
        this.isPenaltyActive = true;
        
        const participantName = this.participantName.value.trim() || 'Anónimo';
        const penaltyMessages = [
            '¡FALSA SALIDA! - Penalización: 5 segundos',
            '¡SALIDA ANTICIPADA! - Penalización: 3 segundos', 
            '¡JUMP START! - Penalización: 10 segundos',
            '¡SALIDA PREMATURA! - Penalización: 2 segundos',
            '¡FALSE START! - Penalización: 5 segundos'
        ];
        
        const randomPenalty = penaltyMessages[Math.floor(Math.random() * penaltyMessages.length)];
        const penaltyTime = this.extractPenaltyTime(randomPenalty);
        
        this.timerStatus.textContent = randomPenalty;
        this.timerStatus.style.color = '#ff4444';
        
        // Apagar todas las luces
        this.turnOffAllLights();
        
        // Guardar penalización
        await this.savePenalty(participantName, randomPenalty, penaltyTime);
        this.updateHistory();
        
        // Mostrar botón de reinicio inmediatamente
        this.startButton.textContent = 'REINICIAR';
        this.startButton.disabled = false;
        
        // Actualizar mensaje después de un momento para ser más claro
        setTimeout(() => {
            this.timerStatus.textContent = 'Presiona REINICIAR para intentar de nuevo';
            this.timerStatus.style.color = '#ff6b35';
        }, 2000);
        
        // NO iniciar el cronómetro automáticamente
        // El usuario debe presionar REINICIAR para intentar de nuevo
    }

    extractPenaltyTime(penaltyMessage) {
        const match = penaltyMessage.match(/(\d+)\s*segundos?/);
        return match ? parseInt(match[1]) : 5;
    }

    lightUpTrafficLight(lightIndex) {
        const lights = this.lights[lightIndex].querySelectorAll('.light');
        lights.forEach(light => {
            light.classList.add('active');
        });
    }

    turnOffAllLights() {
        this.lights.forEach(lightContainer => {
            const lights = lightContainer.querySelectorAll('.light');
            lights.forEach(light => {
                light.classList.remove('active');
            });
        });
    }

    startTimer() {
        this.isRunning = true;
        this.timer = 0;
        this.timerStatus.textContent = '¡ARRANCA!';
        this.startButton.textContent = 'DETENER';
        this.startButton.disabled = false;
        
        this.timerInterval = setInterval(() => {
            this.timer += 10;
            this.updateTimerDisplay();
        }, 10);
    }

    async stopTimer() {
        if (!this.isRunning) return;
        
        clearInterval(this.timerInterval);
        this.isRunning = false;
        this.isSequenceActive = false;
        
        const participantName = this.participantName.value.trim() || 'Anónimo';
        const timeResult = this.formatTime(this.timer);
        
        await this.saveTime(participantName, timeResult);
        this.updateHistory();
        
        this.timerStatus.textContent = `Tiempo: ${timeResult}`;
        this.startButton.textContent = '¡ARRANCA!';
        this.startButton.disabled = false;
    }

    updateTimerDisplay() {
        this.timerDisplay.textContent = this.formatTime(this.timer);
    }

    formatTime(milliseconds) {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const ms = Math.floor((milliseconds % 1000) / 10);
        
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}:${ms.toString().padStart(2, '0')}`;
    }

    // Función para convertir tiempo en formato MM:SS:MS a milisegundos
    timeToMilliseconds(timeString) {
        const parts = timeString.split(':');
        const minutes = parseInt(parts[0]) || 0;
        const seconds = parseInt(parts[1]) || 0;
        const milliseconds = parseInt(parts[2]) || 0;
        
        return (minutes * 60 + seconds) * 1000 + milliseconds * 10;
    }

    async saveTime(participantName, time) {
        const timeRecord = {
            id: Date.now(),
            participant: participantName,
            time: time,
            type: 'time',
            date: new Date().toLocaleString('es-ES')
        };
        
        this.history.unshift(timeRecord);
        
        // Mantener solo los últimos 50 registros
        if (this.history.length > 50) {
            this.history = this.history.slice(0, 50);
        }
        
        // Guardar en la nube
        await this.saveDataToCloud();
    }

    async savePenalty(participantName, penaltyMessage, penaltyTime) {
        const penaltyRecord = {
            id: Date.now(),
            participant: participantName,
            penalty: penaltyMessage,
            penaltyTime: penaltyTime,
            type: 'penalty',
            date: new Date().toLocaleString('es-ES')
        };
        
        this.penalties.unshift(penaltyRecord);
        
        // Mantener solo los últimos 50 registros
        if (this.penalties.length > 50) {
            this.penalties = this.penalties.slice(0, 50);
        }
        
        // Guardar en la nube
        await this.saveDataToCloud();
    }

    // Funciones para JSONBin.io
    async loadDataFromCloud() {
        try {
            const response = await fetch(`https://api.jsonbin.io/v3/b/${this.jsonBinId}/latest`, {
                headers: {
                    'X-Master-Key': this.jsonBinApiKey,
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                this.history = data.record.history || [];
                this.penalties = data.record.penalties || [];
                console.log('Datos cargados desde la nube:', { history: this.history.length, penalties: this.penalties.length });
            } else {
                console.log('No hay datos en la nube, usando datos locales');
                this.history = JSON.parse(localStorage.getItem('f1History')) || [];
                this.penalties = JSON.parse(localStorage.getItem('f1Penalties')) || [];
            }
        } catch (error) {
            console.log('Error cargando datos de la nube, usando datos locales:', error);
            this.history = JSON.parse(localStorage.getItem('f1History')) || [];
            this.penalties = JSON.parse(localStorage.getItem('f1Penalties')) || [];
        }
        
        this.updateHistory();
    }

    async saveDataToCloud() {
        try {
            // Primero cargar datos existentes para no sobrescribir
            const existingResponse = await fetch(`https://api.jsonbin.io/v3/b/${this.jsonBinId}/latest`, {
                headers: {
                    'X-Master-Key': this.jsonBinApiKey
                }
            });
            
            let existingData = { history: [], penalties: [] };
            if (existingResponse.ok) {
                const existing = await existingResponse.json();
                existingData = existing.record;
            }
            
            // Combinar datos existentes con los nuevos
            const combinedData = {
                history: [...existingData.history, ...this.history.filter(newItem => 
                    !existingData.history.some(existingItem => existingItem.id === newItem.id)
                )],
                penalties: [...existingData.penalties, ...this.penalties.filter(newItem => 
                    !existingData.penalties.some(existingItem => existingItem.id === newItem.id)
                )],
                lastUpdated: new Date().toISOString()
            };

            const response = await fetch(`https://api.jsonbin.io/v3/b/${this.jsonBinId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Master-Key': this.jsonBinApiKey
                },
                body: JSON.stringify(combinedData)
            });

            if (response.ok) {
                console.log('Datos guardados en la nube exitosamente');
                // Actualizar datos locales con los combinados
                this.history = combinedData.history;
                this.penalties = combinedData.penalties;
            } else {
                console.log('Error guardando en la nube, guardando localmente');
                localStorage.setItem('f1History', JSON.stringify(this.history));
                localStorage.setItem('f1Penalties', JSON.stringify(this.penalties));
            }
        } catch (error) {
            console.log('Error de conexión, guardando localmente:', error);
            localStorage.setItem('f1History', JSON.stringify(this.history));
            localStorage.setItem('f1Penalties', JSON.stringify(this.penalties));
        }
    }

    loadHistory() {
        this.loadDataFromCloud();
    }

    updateHistory() {
        // Separar tiempos y penalizaciones
        const timeRecords = [...this.history];
        const penaltyRecords = [...this.penalties];
        
        // Ordenar tiempos del mejor (más rápido) al peor (más lento)
        timeRecords.sort((a, b) => {
            const timeA = this.timeToMilliseconds(a.time);
            const timeB = this.timeToMilliseconds(b.time);
            return timeA - timeB; // Menor tiempo primero (mejor tiempo)
        });
        
        // Ordenar penalizaciones por fecha (más reciente primero)
        penaltyRecords.sort((a, b) => b.id - a.id);
        
        // Combinar: tiempos ordenados primero, luego penalizaciones
        const allRecords = [...timeRecords, ...penaltyRecords];
        
        if (allRecords.length === 0) {
            this.historyList.innerHTML = '<p class="no-history">No hay registros aún</p>';
            return;
        }

        this.historyList.innerHTML = allRecords.map(record => {
            if (record.type === 'penalty') {
                return `
                    <div class="history-item penalty-item">
                        <div class="participant">${record.participant}</div>
                        <div class="penalty">${record.penalty}</div>
                        <div class="date">${record.date}</div>
                    </div>
                `;
            } else {
                return `
                    <div class="history-item">
                        <div class="participant">${record.participant}</div>
                        <div class="time">${record.time}</div>
                        <div class="date">${record.date}</div>
                    </div>
                `;
            }
        }).join('');
    }

    async clearHistory() {
        if (confirm('¿Estás seguro de que quieres limpiar todo el historial?')) {
            this.history = [];
            this.penalties = [];
            localStorage.removeItem('f1History');
            localStorage.removeItem('f1Penalties');
            await this.saveDataToCloud();
            this.updateHistory();
        }
    }

    showAdminModal() {
        this.adminModal.style.display = 'block';
        this.adminPasswordInput.value = '';
        this.loginError.style.display = 'none';
        this.adminPasswordInput.focus();
    }

    hideAdminModal() {
        this.adminModal.style.display = 'none';
        this.adminPasswordInput.value = '';
        this.loginError.style.display = 'none';
    }

    authenticateAdmin() {
        const enteredPassword = this.adminPasswordInput.value.trim();
        
        if (enteredPassword === this.adminPassword) {
            this.isAdminAuthenticated = true;
            this.hideAdminModal();
            this.showAdminControls();
            this.showSuccessMessage();
        } else {
            this.showLoginError();
        }
    }

    showAdminControls() {
        this.clearHistoryBtn.style.display = 'inline-block';
        this.adminLoginBtn.textContent = '👑 Admin';
        this.adminLoginBtn.style.background = 'linear-gradient(45deg, #fdcb6e, #e17055)';
    }

    showLoginError() {
        this.loginError.style.display = 'block';
        this.adminPasswordInput.value = '';
        this.adminPasswordInput.focus();
        
        // Ocultar error después de 3 segundos
        setTimeout(() => {
            this.loginError.style.display = 'none';
        }, 3000);
    }

    showSuccessMessage() {
        const originalText = this.timerStatus.textContent;
        this.timerStatus.textContent = '✅ Acceso de administrador concedido';
        this.timerStatus.style.color = '#00ff00';
        
        setTimeout(() => {
            this.timerStatus.textContent = originalText;
            this.timerStatus.style.color = '#ff6b35';
        }, 2000);
    }

    resetAll() {
        // Detener cualquier proceso en curso
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        if (this.sequenceInterval) {
            clearInterval(this.sequenceInterval);
        }
        
        // Resetear variables
        this.timer = 0;
        this.isRunning = false;
        this.isSequenceActive = false;
        this.isPenaltyActive = false;
        this.currentLight = 0;
        
        // Resetear interfaz
        this.timerDisplay.textContent = '00:00:000';
        this.timerStatus.textContent = this.isMobile ? 'Toca el botón para arrancar' : 'Presiona ESPACIO para arrancar';
        this.timerStatus.style.color = '#ff6b35';
        this.startButton.textContent = '¡ARRANCA!';
        this.startButton.disabled = false;
        
        // Apagar todas las luces
        this.turnOffAllLights();
    }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new F1Simulator();
});

// Prevenir el scroll cuando se presiona espacio
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
    }
});


