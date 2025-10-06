import grpc
from concurrent import futures
import time

import service_pb2
import service_pb2_grpc

class WordCounterService(service_pb2_grpc.WordCounterServiceServicer):
    def CountWords(self, request, context):
        text = request.text
        word_count = len(text.split())
        print(f'Texto recebido: "{text}" - Número de palavras: {word_count}')
        return service_pb2.WordCountResponse(word_count=word_count)

def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    service_pb2_grpc.add_WordCounterServiceServicer_to_server(WordCounterService(), server)
    server.add_insecure_port('[::]:50051')
    server.start()
    print("Servidor A (Python) rodando em porta 50051...", flush=True)
    try:
        while True:
            time.sleep(86400)
    except KeyboardInterrupt:
        server.stop(0)

if __name__ == '__main__':
    serve()
