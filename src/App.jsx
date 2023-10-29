import React, { useRef, useEffect, useState } from 'react'
import { firestore, timestamp } from './services/firebase'
import 'firebase/compat/firestore';
import { Layout, theme, Button, Form, Input, Card, Table, Col, Row, Popconfirm, Space, message, FloatButton } from 'antd';
import { InfoCircleOutlined, SearchOutlined, DeleteOutlined, EditOutlined, CopyOutlined } from '@ant-design/icons'
import Highlighter from 'react-highlight-words';
const {  Header, Content } = Layout;


function App() {
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [dataSource, setDataSource] = useState([])
  const [taskName, setTaskName] = useState('')
  const [taskDesc, setTaskDesc] = useState('')
  const [update, setUpdate] = useState(false)
  const [dataKey, setDataKey] = useState('')
  const [pagination, setPagination] = useState({ current: 1, pageSize: 5 });
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const searchInput = useRef(null);
  const db = firestore;

  const success = (msg = 'Cadastro realizado!') => {
    messageApi.open({
      type: 'success',
      content: msg,
    });
  };

  const error = (msg = 'Erro ao cadastrar!') => {
    messageApi.open({
      type: 'error',
      content: msg,
    });
  };

  //filtro na tabela
  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  //limpa filtro
  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText('');
  };

  //monta o html e configura a pesquisa em um campo especifico
  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
      <div
        style={{
          padding: 8,
        }}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{
            marginBottom: 8,
            display: 'block',
          }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{
              width: 90,
            }}
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{
              width: 90,
            }}
          >
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              confirm({
                closeDropdown: false,
              });
              setSearchText(selectedKeys[0]);
              setSearchedColumn(dataIndex);
            }}
          >
            Filter
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
          >
            close
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined
        style={{
          color: filtered ? '#1677ff' : undefined,
        }}
      />
    ),
    onFilter: (value, record) =>
      record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{
            backgroundColor: '#ffc069',
            padding: 0,
          }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      ),
  });

  //colunas da tabela
  const columns = [
    {
      title: 'Tarefa',
      dataIndex: 'title',
      width: '30%',
      ...getColumnSearchProps('title')
    },
  
    {
      desc: 'Descrição',
      dataIndex: 'desc',
      width: '50%',
    },
    {
      title: 'Ações',
      dataIndex: 'action',
      render: (_, record) =>
        <Space wrap>
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => handleInputs(record.key, record.title, record.desc)}
            />
            <Popconfirm okText="Sim" cancelText="Cancelar" title="Tem certeza?" onConfirm={() => handleDelete(record.key)}>
                <Button
                type="primary"
                danger
                icon={<DeleteOutlined />}
              />
            </Popconfirm>
        </Space>
    },
  ];



  useEffect(() =>{
    //carrega os dados do firebase da coleção tasks
    const loadTasks = () =>{
      db.collection('tasks').onSnapshot((snapshot) =>{
        const data =
          snapshot.docs.map((doc) => ({
            id: doc.id,
            data: doc.data(),
          }));

          // seta os dados
          setDataSource(
            data.map((doc) => ({
              key: doc.id,
              title: doc.data.title,
              desc: doc.data.desc,
            }))
          );
      })
    }

    loadTasks();

  }, [])

  //cadastrar um novo registro no firebase
  const createTask = (data) => {
    db.collection("tasks").add({
      title: data.title,
      desc: data.desc,
      created_at: timestamp,
    }).then(res =>{
      success();
    }).catch(err =>{
      error();
    })
    form.resetFields()
  }

  //configuração da paginação
  const onChange = (pagination, filters, sorter, extra) => {
    console.log('params', pagination, filters, sorter, extra);
    setPagination({ ...pagination });
  };

  //deleta um registro do firebase
  const handleDelete = (key) => {
    db.collection('tasks').doc(key).delete()
    .then(()=>{
      error('Excluido com sucesso!')
    }).catch(()=>{
      error('Erro ao excluir!')
    })
    const newData = dataSource.filter((item) => item.key !== key);
    setDataSource(newData);
  };

  //passa os dados para os campo do formulário
  const handleInputs = (key, title, desc) => {
    setTaskName(title)
    setTaskDesc(desc)
    form.setFieldsValue({
      title: title,
      desc: desc,
    })
    setUpdate(true)
    setDataKey(key)
  }

  //atualiza um registro no firebase
  const updateTask = (data) => {

    db.collection('tasks').doc(dataKey).update({
      title: data.title,
      desc: data.desc,
      created_at: timestamp,
    }).then(() =>{
      success('Atualizado com sucesso!')
    }).catch(() =>{
      error('Erro ao atualizar')
    })
    form.resetFields()
    setUpdate(false)
  }

  //copia para a área de transferência
  const copyTransfer = async () =>{
    const currentDate = new Date();
    const initDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
    const endDay = new Date(initDay);
    endDay.setDate(endDay.getDate() + 1);


    const snapshot = await db.collection('tasks')
                              .where('created_at', '>=', initDay)
                              .where('created_at', '<', endDay)
                              .get();

      const data =
      snapshot.docs.map((doc) => ({
        id: doc.id,
        data: doc.data(),
      }));

  const trasnfer = prepareReport(data);
  navigator.clipboard.writeText(trasnfer);
  success('Copiado para a área de transferência!');

  }

  const prepareReport = (data) => {
    // Utilize o método map para formatar os dados conforme necessário
    const formatList = data.map((item) => {
      // Acesse os dados do documento
      const { title, desc } = item.data;
      
     const day = timestamp.toDate().getDate()
     const month = (timestamp.toDate().getMonth()+1)
     const year = timestamp.toDate().getFullYear()

     const date = `${day}/${month}/${year}`
  
      // Formate os dados conforme necessário
      const listFormated = `Título: ${title}\nDescrição: ${desc}\nData: ${date}\n`;
  
      return listFormated;
    });
  
    // Junte todas as linhas formatadas em uma única string
    const textEnd = formatList.join('\n');
  
    // Retorna a string formatada para a área de transferência
    return textEnd;
  };

  

  
  
  
  

  //configuração de thema do antd
  const {
    // eslint-disable-next-line no-unused-vars
    token: { colorBgContainer },
  } = theme.useToken();

  const headerStyle = {
    width: '100%',
    display: 'flex',
  }

  const contentStyle = {
      minHeight: '550px',
      padding: '20px 40px',
      alignItems: 'stretch'
  }

  return (
    <Layout>
       {contextHolder}
       <FloatButton
          shape="circle"
          type="primary"
          style={{
            right: 24,
          }}
          icon={<CopyOutlined />}
          tooltip={<div>Copiar</div>}
          onClick={copyTransfer}
        />
      <Header style={headerStyle}>
        <h1 style={{ color: '#fff' }}>GERENCIADOR DE TAREFAS</h1>
      </Header>
      <Layout hasSider>
        <Content style={contentStyle}>
          <Row style={{ gap: '10px', justifyContent: 'center', alignItems: 'stretch' }}>
              <Col span={7}>
                <Card style={{ height: '100%' }}>
                    <Form
                        form={form}
                        onFinish={update == false ? createTask : updateTask}
                        layout="vertical"
                      >

                        <Form.Item 
                        name='title' 
                        value={taskName} 
                        onChange={(e) => setTaskName(e.target.value)}
                        label="Tarefa" 
                        required 
                        tooltip="Campo obrigatório">
                            <Input  placeholder="Titulo da tarefa" />
                        </Form.Item>
                        <Form.Item
                          label="Descrição"
                          name='desc'
                          value={taskDesc}
                          onChange={(e) => setTaskDesc(e.target.value)}
                          tooltip={{
                            title: 'Campo obrigatório',
                            icon: <InfoCircleOutlined />,
                          }}
                        >
                            <Input.TextArea  placeholder="Descrição da tarefa" />
                        </Form.Item>
                        <Form.Item>
                            <Button type="primary" htmlType="submit">{update == true ? 'Atualizar' : 'Salvar'}</Button>
                          </Form.Item>
                      </Form>
                  </Card>
              </Col>
              <Col span={16}>
                <Card>
                  <Table 
                  columns={columns} 
                  dataSource={dataSource} 
                  pagination={pagination} 
                  onChange={onChange} 
                  />
                </Card>
              </Col>
          </Row>
        </Content>
      </Layout>
    </Layout>
  )
}

export default App;
