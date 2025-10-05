import grpc
from concurrent import futures
import time

import service_pb2
import service_pb2_grpc

class VowelCounterService(service_pb2_grpc.VowelCounterServiceServicer):
    def CountVowels(self, request, context):
        text = request.text.lower()
        vowels = 'aeiouáéíóúãõâêîôû'
        count = sum(1 for ch in text if ch in vowels)
        print(f"Texto recebido: {request.text} → Vogais: {count}")
        return service_pb2.VowelCountResponse(vowel_count=count)

def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    service_pb2_grpc.add_VowelCounterServiceServicer_to_server(VowelCounterService(), server)
    server.add_insecure_port('[::]:50052')
    server.start()
    print("Servidor B (Python) rodando em porta 50052...")
    try:
        while True:
            time.sleep(86400)
    except KeyboardInterrupt:
        server.stop(0)

if __name__ == '__main__':
    serve()
