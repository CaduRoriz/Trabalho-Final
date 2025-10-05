#include <iostream>
#include <memory>
#include <string>
#include <sstream>
#include <grpcpp/grpcpp.h>

#include "service.grpc.pb.h"

using grpc::Server;
using grpc::ServerBuilder;
using grpc::ServerContext;
using grpc::Status;

using textanalyzer::TextRequest;
using textanalyzer::WordCountResponse;
using textanalyzer::WordCounterService;

class WordCounterServiceImpl final : public WordCounterService::Service {
public:
    Status CountWords(ServerContext* context, const TextRequest* request,
                      WordCountResponse* reply) override {
        std::string text = request->text();
        std::istringstream iss(text);
        std::string word;
        int count = 0;

        while (iss >> word) {
            count++;
        }

        std::cout << "Texto recebido: \"" << text << "\" - Número de palavras: " << count << std::endl;
        reply->set_word_count(count);
        return Status::OK;
    }
};

void RunServer() {
    std::string server_address("0.0.0.0:50051");
    WordCounterServiceImpl service;

    ServerBuilder builder;
    builder.AddListeningPort(server_address, grpc::InsecureServerCredentials());
    builder.RegisterService(&service);

    std::unique_ptr<Server> server(builder.BuildAndStart());
    std::cout << "Microserviço A (C++) rodando em " << server_address << "..." << std::endl;

    server->Wait();
}

int main() {
    RunServer();
    return 0;
}
