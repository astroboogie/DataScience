import tensorflow as tf
from tensorflow.examples.tutorials.mnist import input_data

mnist = input_data.read_data_sets("/tmp/data/", one_hot=True)
# one_hot means one value is on, rest are off
#10 classes, 0-9
# 0 = [1, 0, 0, 0, 0... 9 zeros]
# 1 = [0, 1, 0, 0, ...]

#number of nodes in each hidden layer
n_nodes_hl1 = 500
n_nodes_hl2 = 500
n_nodes_hl3 = 500

#classes 0-9
n_classes =  10

#manipulates 100 images at a time
batch_size = 100

#784 pixels wide (each image is flattened to 784 pixels)
x = tf.placeholder('float', [None, 784])

#number of images in database
y = tf.placeholder('float')

def neural_network_model(data):

	# creates a tensor of weights of your data using random_normal, input data * weight
	hidden_1_layer = {'weights':tf.Variable(tf.random_normal([784, n_nodes_hl1])),
					  # bias are added after weights in case inputs are 0
					  'biases':tf.Variable(tf.random_normal([n_nodes_hl1]))}
	
	hidden_2_layer = {'weights':tf.Variable(tf.random_normal([n_nodes_hl1, n_nodes_hl2])),
					  'biases':tf.Variable(tf.random_normal([n_nodes_hl2]))}
	
	hidden_3_layer = {'weights':tf.Variable(tf.random_normal([n_nodes_hl2, n_nodes_hl3])),
					  'biases':tf.Variable(tf.random_normal([n_nodes_hl3]))}

	output_layer = {'weights':tf.Variable(tf.random_normal([n_nodes_hl3, n_classes])),
					'biases':tf.Variable(tf.random_normal([n_classes]))}

	# (input_data * weights) + biases
	l1 = tf.add(tf.matmul(data, hidden_1_layer['weights']), hidden_1_layer['biases'])
	#activation function, rectifier (relu)
	l1 = tf.nn.relu(l1)

	l2 = tf.add(tf.matmul(l1, hidden_2_layer['weights']), hidden_2_layer['biases'])
	l2 = tf.nn.relu(l2)

	l3 = tf.add(tf.matmul(l2, hidden_3_layer['weights']), hidden_3_layer['biases'])
	l3 = tf.nn.relu(l3)

	output = tf.add(tf.matmul(l3, output_layer['weights']), output_layer['biases'])

	return output

def train_neural_network(x):
	prediction = neural_network_model(x)
	#calculates difference between prediction we have and the known label y
	cost = tf.reduce_mean(tf.nn.softmax_cross_entropy_with_logits(prediction,y))

	#trains the AdamOptimizer to increase cost
	optimizer = tf.train.AdamOptimizer().minimize(cost)

	# cycles of feed forward + backpropogation
	hm_epochs = 10

	# runs session to compute
	with tf.Session() as sess:
		sess.run(tf.initialize_all_variables())

		for epoch in range(hm_epochs):
			epoch_loss = 0
			# chunks through data for us
			for i in range(int(mnist.train.num_examples/batch_size)):
				epoch_x, epoch_y = mnist.train.next_batch(batch_size)
				i, c = sess.run([optimizer, cost], feed_dict = {x: epoch_x, y: epoch_y})
				epoch_loss += c
			print('Epoch', epoch,' completed out of ',hm_epochs, 'loss: ', epoch_loss)

		correct = tf.equal(tf.argmax(prediction, 1), tf.argmax(y, 1))
		accuracy = tf.reduce_mean(tf.cast(correct, 'float'))
		print('Accuracy:', accuracy.eval({x:mnist.test.images, y:mnist.test.labels}))

train_neural_network(x)

# x1 = tf.constant(5)
# x2 = tf.constant(6)

# result = tf.mul(x1, x2)
# print(result)

# with tf.SEssion() as sess:
# 	output = sess.run(result)
# 	print(output)

# print(output)