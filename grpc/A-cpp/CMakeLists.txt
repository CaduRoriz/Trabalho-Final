cmake_minimum_required(VERSION 3.10)
project(word_counter_server)

# Define o padrão C++
set(CMAKE_CXX_STANDARD 17)

# Localiza gRPC e Protobuf
find_package(Protobuf REQUIRED)
find_package(gRPC REQUIRED)

# protoc
set(PROTO_SRC
    ${CMAKE_CURRENT_SOURCE_DIR}/service.pb.cc
    ${CMAKE_CURRENT_SOURCE_DIR}/service.grpc.pb.cc
)

# binário
add_executable(servera
    servera.cc
    ${PROTO_SRC}
)

# cabeçalhos
target_include_directories(servera PRIVATE
    ${Protobuf_INCLUDE_DIRS}
    ${gRPC_INCLUDE_DIRS}
)

# bibliotecas
target_link_libraries(servera
    gRPC::grpc++
    protobuf::libprotobuf
)
